import { EdgeDBService } from "@/edgedb/edgedb.service";
import { EmailService } from "@/email/email.service";
import { LdapService } from "@/ldap/ldap.service";
import { CreateReasonDto } from "@/root/dto/reason.dto";
import { ErrorCodes } from "@/shared/constants/ErrorCodes";
import { sleep } from "@/shared/functions/sleep";
import { ldapLibraryToUcardNumber } from "@/shared/functions/utils";
import { PartialUserProps, UserProps, UsersService } from "@/users/users.service";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e from "@dbschema/edgeql-js";
import { std } from "@dbschema/interfaces";
import { users } from "@ignis/types";
import type { LocationName, PartialLocation, QueueEntry, Training } from "@ignis/types/sign_in";
import type { Infraction, InfractionType, PartialUser, User, UserWithInfractions } from "@ignis/types/users";
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CardinalityViolationError, ConstraintViolationError, InvalidValueError } from "edgedb";

export const REP_ON_SHIFT = "Rep On Shift";
export const REP_OFF_SHIFT = "Rep Off Shift";
export const LOCATIONS = Object.keys(LocationNameSchema.Values) as readonly LocationName[];

function formatInfraction(infraction: Infraction) {
  switch (infraction.type) {
    case "PERM_BAN":
      return `User is permanently banned from the iForge. Reason: ${infraction.reason}`;
    case "TEMP_BAN":
      return `User is banned from the iForge for ${infraction.duration}. Reason: ${infraction.reason}`;
    case "WARNING":
      return `User has an unresolved warning. Reason: ${infraction.reason}`;
    case "RESTRICTION":
      return `User has an unresolved restriction. Reason: ${infraction.reason}`;
    case "TRAINING_ISSUE":
      return `User has an unresolved training issue. Reason: ${infraction.reason}`;
    default:
      throw new Error(`Unknown infraction type: ${infraction.type}`);
  }
}

const QueuePlaceProps = e.shape(e.sign_in.QueuePlace, () => ({
  user: PartialUserProps,
  created_at: true,
  id: true,
  notified_at: true,
  ends_at: true,
}));

@Injectable()
export class SignInService implements OnModuleInit {
  private readonly logger: Logger;

  constructor(
    private readonly dbService: EdgeDBService,
    private readonly userService: UsersService,
    private readonly ldapService: LdapService,
    private readonly emailService: EmailService,
  ) {
    this.logger = new Logger(SignInService.name);
  }

  async onModuleInit() {
    // const places = await this.dbService.query(
    //   e.select(e.sign_in.QueuePlace, (place) => ({
    //     filter: place.can_sign_in,
    //     user: PartialUserProps,
    //     location: true,
    //   })),
    // );
    // for (const place of places) {
    //   this.removeUserFromQueueTask(place.location.toLowerCase() as Location, place.user).catch();
    // }
  }

  async getLocationStatus(location: LocationName): Promise<PartialLocation> {
    const status = (await this.dbService.query(
      e.assert_exists(
        e.select(e.sign_in.Location, (loc) => ({
          on_shift_rep_count: e.count(loc.on_shift_reps),
          off_shift_rep_count: e.count(loc.off_shift_reps),
          user_count: e.op(e.count(loc.sign_ins), "-", e.count(loc.supervising_reps)),
          max: loc.max_count,
          count_in_queue: e.count(loc.queued),
          out_of_hours: true,
          name: true,
          status: true,
          opening_time: true,
          closing_time: true,
          filter_single: { name: location },
        })),
      ),
    )) as unknown as Partial<PartialLocation>; // the LocalTimes serialise to string
    status.needs_queue = await this.queueInUse(location);
    return status as PartialLocation;
  }

  async getLocation(name: LocationName) {
    try {
      return await this.dbService.query(
        e.assert_exists(
          e.select(e.sign_in.Location, () => ({
            ...e.sign_in.Location["*"],
            sign_ins: {
              ...e.sign_in.SignIn["*"],
              reason: e.sign_in.Reason["*"],
              user: (user) => ({
                ...PartialUserProps(user),
                ...e.is(e.users.Rep, {
                  teams: { name: true, description: true, id: true },
                }),
              }),
            },
            queued: {
              ...e.sign_in.QueuePlace["*"],
              user: PartialUserProps,
            },
            filter_single: { name },
          })),
        ),
      );
    } catch (error) {
      if (error instanceof InvalidValueError) {
        throw new NotFoundException(`${name} is not a known location`);
      }
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async signOutAllUsers() {
    await this.dbService.query(
      e.for(
        e.select(e.sign_in.Location, () => ({
          sign_ins: true,
        })).sign_ins,
        (sign_in) => {
          return e.update(sign_in, () => ({
            set: {
              ends_at: new Date(),
            },
          }));
        },
      ),
    );
    await this.dbService.query(e.delete(e.sign_in.QueuePlace));
  }

  async removeUserFromQueueTask(location: LocationName, user: PartialUser) {
    await sleep(1000 * 60 * 15); // This isn't committed to DB but that should be fine
    await this.removeFromQueue(location, user.id);
  }

  async getUserForSignIn(
    location: LocationName,
    ucard_number: string,
  ): Promise<User & { is_rep: boolean; registered: boolean; signed_in: boolean }> {
    const sign_in = e.select(e.sign_in.SignIn, (sign_in) => ({
      filter_single: e.op(
        e.op(sign_in.user.ucard_number, "=", ldapLibraryToUcardNumber(ucard_number)),
        "and",
        e.op("not", sign_in.signed_out),
      ),
    }));
    let user:
      | (User & {
          is_rep: boolean;
          registered: boolean;
          signed_in: boolean;
          location?: LocationName;
          teams?: users.ShortTeam[] | null;
        })
      | null = await this.dbService.query(
      e.select(sign_in.user, (user) => ({
        ...UserProps(user),
        is_rep: e.select(e.op(user.__type__.name, "=", "users::Rep")),
        registered: e.select(true as boolean),
        signed_in: e.select(true as boolean),
        location: e.assert_exists(sign_in.location.name),
        ...e.is(e.users.Rep, {
          teams: { name: true, description: true, id: true },
        }),
      })),
    );
    if (user?.location && user.location !== location) {
      throw new BadRequestException({
        message: `User ${ucard_number} is already signed in at a different location, please sign out there before signing in.`,
        code: ErrorCodes.already_signed_in_to_location,
      });
    }
    if (user) {
      return user;
    }
    user = await this.dbService.query(
      e.select(e.users.User, (user) => ({
        filter_single: { ucard_number: ldapLibraryToUcardNumber(ucard_number) },
        ...UserProps(user),
        is_rep: e.select(e.op(user.__type__.name, "=", "users::Rep")),
        registered: e.select(true as boolean),
        signed_in: e.select(false as boolean),
        ...e.is(e.users.Rep, {
          teams: { name: true, description: true, id: true },
        }),
      })),
    );
    if (user) {
      return user;
    }

    this.logger.log(`Registering user: ${ucard_number} at location: ${location}`, SignInService.name);

    // no user registered, fetch from ldap
    const ldapUser = await this.ldapService.findUserByUcardNumber(ucard_number);
    if (!ldapUser) {
      throw new NotFoundException({
        message: `User with ucard no ${ucard_number} couldn't be found. Perhaps you made a typo? (it should look like 001739897)`,
        code: ErrorCodes.ldap_not_found,
      });
    }

    user = await this.dbService.query(
      e.select(
        e.insert(e.sign_in.UserRegistration, {
          location: e.select(e.sign_in.Location, () => ({ filter_single: { name: location } })),
          user: e.insert(e.users.User, this.userService.ldapUserProps(ldapUser)),
        }).user,
        (user) => ({
          ...UserProps(user),
          is_rep: e.select(false as boolean),
          registered: e.select(false as boolean),
          signed_in: e.select(false as boolean),
        }),
      ),
    );

    await this.emailService.sendWelcomeEmail(user);
    return user;
  }

  async getTrainings(id: string, name: LocationName): Promise<Training[]> {
    const rep_training = e.select(e.sign_in.Location, () => ({ filter_single: { name } })).on_shift_reps.training;

    const { training } = await this.dbService.query(
      e.assert_exists(
        e.select(e.users.User, (user) => ({
          training: (training) => ({
            id: true,
            name: true,
            compulsory: true,
            in_person: true,
            description: true,
            rep: {
              id: true,
              description: true,
            },
            "@created_at": true,
            "@in_person_created_at": true,
            expired: e.assert_exists(
              e.op(
                e.op(e.op(training["@created_at"], "+", training.expires_after), "<", e.datetime_of_statement()),
                "if",
                e.op("exists", training.expires_after),
                "else",
                false,
              ),
            ),
            selectable: e.op(
              // if they're a rep they can sign in off shift to use the machines they want even if the reps aren't trained
              // ideally first comparison should be `__source__ is users::Rep`
              e.op(
                e.op(e.op(user.__type__.name, "=", "users::Rep"), "or", e.op(training.rep.id, "in", rep_training.id)),
                "and",
                e.op("exists", training["@in_person_created_at"]),
              ),
              "if",
              training.in_person,
              "else",
              true,
            ),
            enabled: false,
            icon_url: true,
            filter: e.all(
              e.set(
                e.op("exists", training.rep),
                e.op(e.cast(e.training.TrainingLocation, name), "in", training.locations),
              ),
            ),
          }),
          filter_single: { id },
        })),
      ),
    );

    const all_training = await this.dbService.query(
      e.select(e.training.Training, (training_) => ({
        id: true,
        name: true,
        compulsory: true,
        in_person: true,
        rep: { id: true, description: true },
        description: true,
        enabled: true,
        icon_url: true,
        filter: e.all(
          e.set(
            e.op(training_.id, "not in", e.cast(e.uuid, e.set(...training.map((training) => training.id)))),
            e.op("exists", training_.rep),
            e.op(e.cast(e.training.TrainingLocation, name), "in", training_.locations),
            training_.enabled,
          ),
        ),
      })),
    );

    return [...training, ...all_training];
  }

  async isRep(ucard_number: number): Promise<boolean> {
    return await this.dbService.query(
      e.op(
        "exists",
        e.select(e.users.Rep, () => ({
          filter_single: { ucard_number },
        })),
      ),
    );
  }

  /**
   * **Note**
   * We don't perform any validation server side to speed up sign ins. There are a couple reasons why:
   *    - speed - having to refetch all the data or deal with cache invalidation is slow or very hard.
   *    - data served to the client is validated.
   *    - the only clients who should be able to insert these are admins.
   *
   * Full flow:
   *
   * [![](https://mermaid.ink/img/pako:eNqNlEFvozAQhf_KyOdGveewqzSQhjZBaYC2KenBgklilRjWNl1VJP99bbAD2V7KiYE3730zFjQkK3MkY7IXtDpA7G056GuSRooKNYYooxySKRX5O4xGv-CuCWT3MKqzDKXc1cXvc9d0ZxSnDcoTTNMZquwAiUQBsaCMM76H21tIIn8NQej5Kz_0JmH8PmwNyxO8pb4QpbDJM8oKzK1o2hJ4hqD1XeOeSYUCc0fg9QS-kT3VWCNMMsU-EXalgCX9QCErmuF1i0neuOTWPCzVIMAS-L3_7ILBeJfjHP2L433aCiIsMFNSh2cHxlFas1lv9hOhMXz9hujCrfS-XdG88Uq0dHOqR1_jn5rpMfqj6JbRxTjweQ8UmOmemWQKVrWoSonwTAuWX0sN0otDCvinUTjXS5QlC1qyh8vWJoVAmn9BxPZcgwUc_ELi34PetgsJLiGPzZzaPqtfUIVSWau9QDwiV67xoR8kudrYt1AL99g3LNJpeawKVNiqRv9pDE187enS2_PonG3Lop15mVqjwSdjBctWEKY-z10arERpRFbx1im6YjMsXofFy7BIhkXcFeSGHFEcKcv1t96YV1uiDpp7S8b6NqfiY0u2_Kx1tFZl9MUzMlaixhtSV7letseo_kUcyXhH9Tmd_wHhkVOk?type=png)](https://mermaid.live/edit#pako:eNqNlEFvozAQhf_KyOdGveewqzSQhjZBaYC2KenBgklilRjWNl1VJP99bbAD2V7KiYE3730zFjQkK3MkY7IXtDpA7G056GuSRooKNYYooxySKRX5O4xGv-CuCWT3MKqzDKXc1cXvc9d0ZxSnDcoTTNMZquwAiUQBsaCMM76H21tIIn8NQej5Kz_0JmH8PmwNyxO8pb4QpbDJM8oKzK1o2hJ4hqD1XeOeSYUCc0fg9QS-kT3VWCNMMsU-EXalgCX9QCErmuF1i0neuOTWPCzVIMAS-L3_7ILBeJfjHP2L433aCiIsMFNSh2cHxlFas1lv9hOhMXz9hujCrfS-XdG88Uq0dHOqR1_jn5rpMfqj6JbRxTjweQ8UmOmemWQKVrWoSonwTAuWX0sN0otDCvinUTjXS5QlC1qyh8vWJoVAmn9BxPZcgwUc_ELi34PetgsJLiGPzZzaPqtfUIVSWau9QDwiV67xoR8kudrYt1AL99g3LNJpeawKVNiqRv9pDE187enS2_PonG3Lop15mVqjwSdjBctWEKY-z10arERpRFbx1im6YjMsXofFy7BIhkXcFeSGHFEcKcv1t96YV1uiDpp7S8b6NqfiY0u2_Kx1tFZl9MUzMlaixhtSV7letseo_kUcyXhH9Tmd_wHhkVOk)
   */
  async signIn(location: LocationName, ucard_number: number, tools: string[], reason_id: string) {
    const { infractions } = await this.preSignInChecks(location, ucard_number, /* post */ true);
    if (infractions.length !== 0) {
      throw new BadRequestException({
        message: `User ${ucard_number} has active infraction(s):\n${infractions.map(formatInfraction).join("\n")}`,
        code: ErrorCodes.user_has_active_infractions,
      });
    }
    const { reason } = await this.verifyReason(reason_id, ucard_number);

    let user: std.BaseObject;
    try {
      user = await this.dbService.query(
        e.insert(e.sign_in.SignIn, {
          location: e.select(e.sign_in.Location, () => ({ filter_single: { name: location } })),
          user: e.assert_exists(
            e.select(e.users.User, () => ({
              filter_single: { ucard_number },
            })),
          ),
          tools,
          reason,
        }).user,
      );
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        throw new BadRequestException({
          message: `User ${ucard_number} already signed in`,
          code: ErrorCodes.already_signed_in_to_location,
        });
      }
      throw error;
    }
    await this.removeFromQueue(location, user.id);
    return "Signed in successfully";
  }

  /** Verify that the user can use the sign in reason given by checking their signed agreements
   * Ideally this can be removed one day.
   */
  async verifyReason(reason_id: string, ucard_number: number, is_rep = false) {
    const agreements_signed = await this.dbService.query(
      e.select(e.users.User, () => ({
        filter_single: { ucard_number },
      })).agreements_signed,
    );
    // check for the user agreement
    const user_agreement = await this.dbService.query(
      e.assert_exists(
        e.select(e.sign_in.Reason, (reason) => ({
          filter_single: e.op(reason.category, "=", e.sign_in.ReasonCategory.PERSONAL_PROJECT),
        })).agreement,
      ),
    );
    if (!agreements_signed.some((agreement) => agreement.id === user_agreement.id)) {
      throw new BadRequestException("User agreement not signed.");
    }

    const query = e.assert_exists(
      e.select(e.sign_in.Reason, () => ({
        name: true,
        agreement: true,
        category: true,
        filter_single: { id: reason_id },
      })),
    );
    const { name, agreement, category } = await this.dbService.query(query);

    if (category === "REP_SIGN_IN" && !is_rep) {
      throw new BadRequestException("User has somehow passed a rep reason");
    }

    if (agreement && !agreements_signed.some((agreement_) => agreement_.id === agreement.id)) {
      throw new BadRequestException(`Agreement ${agreement.id} for ${name} not signed.`);
    }

    return { reason: query, reason_name: name };
  }

  async preSignInChecks(location: LocationName, ucard_number: number, post: boolean = false) {
    if ((await this.getAvailableCapacity(location)) <= 0) {
      if (await this.queueInUse(location)) {
        this.logger.log(
          `Queue in use, Checking if user: ${ucard_number} has queued at location: ${location}`,
          SignInService.name,
        );
        await this.assertHasQueued(location, ucard_number);
      } else {
        throw new HttpException(
          "Failed to sign in, we are at max capacity. Consider using the queue",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
    if (post) {
      // try and delete them from the queue if they're signing in for real
      await this.dbService.query(
        e.delete(e.sign_in.QueuePlace, (place) => ({
          filter_single: e.op(place.user.ucard_number, "=", ucard_number),
        })),
      );
    }

    const user = await this.dbService.query(
      e.select(e.users.User, () => ({
        filter_single: { ucard_number },
        infractions: { type: true, duration: true, reason: true, resolved: true, id: true, created_at: true },
      })),
    );
    if (!user) {
      throw new NotFoundException({
        message: `User with UCard number ${ucard_number} is not registered`,
        code: ErrorCodes.not_registered,
      });
    }
    const { infractions } = user;
    const active_infractions = infractions.filter((infraction) => infraction.resolved); // the final boss of iForge rep'ing enters
    return { infractions: active_infractions };
  }

  async repSignIn(name: LocationName, ucard_number: number, reason_id: string) {
    const { reason, reason_name } = await this.verifyReason(reason_id, ucard_number, /* is_rep */ true);

    if (
      reason_name !== REP_ON_SHIFT &&
      !(await this.dbService.query(e.select(e.sign_in.Location, () => ({ filter_single: { name } })).out_of_hours))
    ) {
      await this.preSignInChecks(name, ucard_number, /* post */ true);
    }

    // TODO this should be client side?
    const user = e.assert_exists(
      e.select(e.users.Rep, () => ({
        filter_single: { ucard_number },
      })),
    );

    const compulsory = e.select(e.training.Training, (training) => ({
      filter: e.op(
        training.compulsory,
        "and",
        e.op(e.cast(e.training.TrainingLocation, name.toUpperCase()), "in", training.locations),
      ),
    }));

    const missing = await this.dbService.query(
      e.select(e.op(compulsory, "except", user.training), () => ({ name: true, id: true })),
    );

    if (missing.length > 0) {
      throw new BadRequestException({
        message: `Rep hasn't completed compulsory on shift-trainings. Missing: ${missing
          .map((training) => training.name)
          .join(", ")}`,
        code: ErrorCodes.compulsory_training_missing,
      });
    }

    try {
      await this.dbService.query(
        e.insert(e.sign_in.SignIn, {
          location: e.select(e.sign_in.Location, () => ({ filter_single: { name } })),
          user,
          tools: [],
          reason,
        }),
      );
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        throw new BadRequestException({
          message: `Rep ${ucard_number} already signed in`,
          code: ErrorCodes.already_signed_in_to_location,
        });
      }
      if (error instanceof InvalidValueError) {
        throw new BadRequestException(
          {
            message: `User ${ucard_number} attempting to sign in is not a rep`,
            code: ErrorCodes.not_rep,
          },
          { cause: error.toString() },
        );
      }
      throw error;
    }
    return "Signed in successfully";
  }

  async updateVisitPurpose(
    name: LocationName,
    ucard_number: number,
    tools: string[] | undefined,
    reason_id: string | undefined,
  ) {
    const { reason } = reason_id ? await this.verifyReason(reason_id, ucard_number) : { reason: undefined };

    try {
      await this.dbService.query(
        e.assert_exists(
          e.update(e.sign_in.SignIn, (sign_in) => {
            const isCorrectLocation = e.op(sign_in.location.name, "=", e.cast(e.sign_in.LocationName, name));
            const userMatches = e.op(sign_in.user.ucard_number, "=", ucard_number);
            const doesNotExist = e.op("not", e.op("exists", sign_in.ends_at));

            return {
              filter_single: e.all(e.set(isCorrectLocation, userMatches, doesNotExist)),
              set: {
                tools,
                reason,
              },
            };
          }),
        ),
      );
    } catch (e) {
      if (e instanceof CardinalityViolationError && e.code === 84017154) {
        console.log(e, e.code);
        throw e; // user not previously signed in
      }
      throw e;
    }
  }

  async signOut(name: LocationName, ucard_number: number) {
    try {
      await this.dbService.query(
        e.assert_exists(
          e.update(e.sign_in.SignIn, (sign_in) => ({
            filter_single: e.all(
              e.set(
                e.op(sign_in.location.name, "=", e.cast(e.sign_in.LocationName, name)),
                e.op(sign_in.user.ucard_number, "=", ucard_number),
                e.op("not", sign_in.signed_out),
              ),
            ),
            set: {
              ends_at: new Date(),
            },
          })),
        ),
      );
    } catch (error) {
      if (error instanceof CardinalityViolationError && error.code === 84017154) {
        throw new BadRequestException({
          message: `User ${ucard_number} was not signed in`,
          code: ErrorCodes.not_signed_in,
        });
      }
      throw error;
    }
    if (await this.dbService.query(e.select(e.sign_in.Location, () => ({ filter_single: { name } })).can_sign_in)) {
      await this.dequeueTop(name);
    }
  }

  // queue management

  /* Are there people queuing currently or has it been manually disabled */
  async queueInUse(name: LocationName) {
    let queuing: boolean;
    try {
      queuing = await this.dbService.query(
        e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name } }))).queue_in_use,
      );
    } catch (e) {
      this.logger.debug(`Queue Disabled at location: ${name}`, SignInService.name);
      throw new HttpException("Queue has been manually disabled", HttpStatus.SERVICE_UNAVAILABLE);
    }

    this.logger.debug(`Queue Enabled: ${queuing}`, SignInService.name);
    return queuing;
  }

  async assertHasQueued(location: LocationName, ucard_number: number) {
    const users_can_sign_in = await this.queuedUsersThatCanSignIn(location);

    if (
      !users_can_sign_in.find((user) => {
        return user.ucard_number === ucard_number;
      })
    ) {
      this.logger.warn(`User ${ucard_number} has not queued at location: ${location}`, SignInService.name);
      throw new HttpException(
        {
          message: "Failed to sign in, we are still waiting for people who have been queued to show up",
          code: ErrorCodes.not_in_queue,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    this.logger.debug(`User ${ucard_number} has queued at location: ${location}`, SignInService.name);
  }

  async getAvailableCapacity(name: LocationName): Promise<number> {
    const location = e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name } })));
    const availableCapacity = await this.dbService.query(
      e.op(
        e.op(location.max_count, "-", e.count(location.sign_ins)),
        "-",
        e.count(location.queued_users_that_can_sign_in),
      ),
    );
    this.logger.debug(`Available capacity for ${name}: ${availableCapacity}`, SignInService.name);
    return availableCapacity;
  }

  async dequeueTop(name: LocationName) {
    const availableCapacity = await this.getAvailableCapacity(name);

    if (availableCapacity > 0) {
      const queuedUsers = await this.dbService.query(
        e.select(e.sign_in.QueuePlace, (queue_place) => ({
          filter: e.op(
            e.op(queue_place.location.name, "=", e.cast(e.sign_in.LocationName, name)),
            "and",
            e.op("not", e.op("exists", queue_place.notified_at)),
          ),
          order_by: {
            expression: queue_place.created_at,
            direction: e.ASC,
          },
          limit: availableCapacity,
          ...QueuePlaceProps(queue_place),
        })),
      );

      this.logger.debug(`Dequeuing ${queuedUsers.length} users for ${name}`, SignInService.name);

      for (const queuedUser of queuedUsers) {
        await this.dbService.query(
          e.update(e.sign_in.QueuePlace, (queue_place) => ({
            filter: e.op(queue_place.id, "=", e.uuid(queuedUser.id)),
            set: {
              notified_at: new Date(),
            },
          })),
        );

        await this.emailService.sendUnqueuedEmail(queuedUser, name);
        this.logger.debug(
          `Sent unqueued email to user ${queuedUser.user.display_name} (${queuedUser.user.ucard_number})`,
          SignInService.name,
        );
      }
    } else {
      this.logger.debug(`No available capacity to dequeue users for ${name}`, SignInService.name);
    }
  }

  async addToQueue(name: LocationName, ucard_number: string) {
    if (!(await this.queueInUse(name))) {
      this.logger.warn(
        `Attempt to add user ${ucard_number} to queue at ${name}, but queue is not in use`,
        SignInService.name,
      );
      throw new HttpException("The queue is currently not in use", HttpStatus.BAD_REQUEST);
    }

    let place: QueueEntry;

    try {
      place = await this.dbService.query(
        e.select(
          e.insert(e.sign_in.QueuePlace, {
            user: e.select(e.users.User, () => ({
              filter_single: { ucard_number: ldapLibraryToUcardNumber(ucard_number) },
            })),
            location: e.select(e.sign_in.Location, () => ({ filter_single: { name } })),
          }),
          QueuePlaceProps,
        ),
      );
      this.logger.debug(`Added user ${ucard_number} to queue at ${name}`, SignInService.name);
    } catch (e) {
      if (e instanceof ConstraintViolationError && e.code === 84017154) {
        this.logger.warn(
          `Attempt to add user ${ucard_number} to queue at ${name}, but user is already in the queue`,
          SignInService.name,
        );
        throw new HttpException("The user is already in the queue", HttpStatus.BAD_REQUEST);
      }
      this.logger.error(
        `Error adding user ${ucard_number} to queue at ${name}: ${(e as Error).message}`,
        SignInService.name,
      );
      throw e;
    }
    await this.emailService.sendQueuedEmail(place, name);
    this.logger.debug(
      `Sent queued email to user ${place.user.display_name} (${place.user.ucard_number})`,
      SignInService.name,
    );
    return place;
  }

  async removeFromQueue(location: LocationName, id: string) {
    await this.dbService.query(
      e.delete(e.sign_in.QueuePlace, () => ({
        filter_single: { id },
      })),
    );
    this.logger.debug(`Removed queue entry with ID ${id} from ${location}`, SignInService.name);
  }

  async queuedUsersThatCanSignIn(name: LocationName) {
    const users = await this.dbService.query(
      e.select(
        e.select(e.sign_in.Location, () => ({ filter_single: { name } })).queued_users_that_can_sign_in,
        PartialUserProps,
      ),
    );
    this.logger.debug(`Found ${users.length} users that can sign in at ${name}`, SignInService.name);
    return users;
  }

  async getReasons() {
    // TODO in future would be nice to only return options that a user is part of due to
    // - Their course
    // - SU clubs
    // - CCAs
    return await this.dbService.query(
      e.select(e.sign_in.Reason, () => ({ ...e.sign_in.Reason["*"], agreement: true })),
    );
  }

  async addReason(reason: CreateReasonDto) {
    return await this.dbService.query(
      e.select(
        e.insert(e.sign_in.Reason, {
          ...reason, // for some reason this works but just passing it directly doesn't
        }),
        () => e.sign_in.Reason["*"],
      ),
    );
  }

  async deleteReason(id: string) {
    return await this.dbService.query(
      e.delete(e.sign_in.Reason, () => ({
        filter_single: { id },
      })),
    );
  }

  async getReasonsLastUpdate() {
    return await this.dbService.query(
      e.assert_exists(
        e.assert_single(
          e.select(e.sign_in.Reason, (sign_in) => ({
            order_by: {
              expression: sign_in.created_at,
              direction: e.DESC,
            },
            limit: 1,
          })).created_at,
        ),
      ),
    );
  }

  async getPopularReasons(name: LocationName) {
    const reasons: any = await this.dbService.query(
      e.select(
        e.group(
          e.select(e.sign_in.SignIn, (sign_in) => ({
            filter: e.op(
              e.op(sign_in.created_at, ">", e.op(e.datetime_current(), "-", e.cal.relative_duration("3d"))),
              "and",
              e.op(sign_in.location.name, "=", e.cast(e.sign_in.LocationName, name)),
            ),
          })),
          (sign_in) => ({
            by: { reason: sign_in.reason },
          }),
        ),
        (group) => ({
          name: e.assert_single(group.elements.reason.name),
          category: e.assert_single(group.elements.reason.category),
          id_: e.assert_single(group.elements.reason.id),
          count: e.count(group.elements),
          order_by: {
            expression: e.count(group.elements),
            direction: e.DESC,
          },
          limit: 5,
        }),
      ),
    );
    return reasons.map((reason: any) => {
      reason.id = reason.id_; // rename id field
      reason.id_ = undefined;
      return reason;
    });
  }
}
