import { EdgeDBService } from "@/edgedb/edgedb.service";
import { EmailService } from "@/email/email.service";
import { LdapService } from "@/ldap/ldap.service";
import { CreateSignInReasonCategoryDto } from "@/root/dto/reason.dto";
import { ErrorCodes } from "@/shared/constants/ErrorCodes";
import { sleep } from "@/shared/functions/sleep";
import { PartialUserProps, UsersService } from "@/users/users.service";
import { SignInLocationSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e from "@dbschema/edgeql-js";
import { std } from "@dbschema/interfaces";
import { getUserTrainingForSignIn } from "@dbschema/queries/getUserTrainingForSignIn.query";
import type { Location, LocationStatus, Training } from "@ignis/types/sign_in";
import type { PartialUser } from "@ignis/types/users";
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CardinalityViolationError, InvalidValueError, QueryAssertionError } from "edgedb";
import { RegisterUserDto } from "./dto/sigs-in-dto";

export const REP_ON_SHIFT = "Rep On Shift";
export const REP_OFF_SHIFT = "Rep Off Shift";
const IN_HOURS_RATIO = 15;
const OUT_OF_HOURS_RATIO = 8;

export const LOCATIONS = Object.keys(SignInLocationSchema.Values).map((location) =>
  location.toLocaleLowerCase(),
) as Location[];

function castLocation(location: Location) {
  return e.cast(e.sign_in.SignInLocation, location.toUpperCase());
}

@Injectable()
export class SignInService implements OnModuleInit {
  private readonly disabledQueue: Set<Location>;

  constructor(
    private readonly dbService: EdgeDBService,
    private readonly userService: UsersService,
    private readonly ldapService: LdapService,
    private readonly emailService: EmailService,
  ) {
    this.disabledQueue = new Set();
  }

  async onModuleInit() {
    for (const location of LOCATIONS) {
      if ((await this.canSignIn(location)) && (await this.queueInUse(location))) {
        this.unqueueTop(location);
      }
    }
  }

  async getStatusForLocation(location: Location): Promise<LocationStatus> {
    const [on_shift_rep_count, off_shift_rep_count, total_count, max, can_sign_in, count_in_queue] = await Promise.all([
      this.onShiftReps(location),
      this.offShiftReps(location),
      this.totalCount(location),
      this.maxCount(location),
      this.canSignIn(location),
      this.countInQueue(location),
      this.outOfHours(),
    ]);

    const user_count = total_count - off_shift_rep_count - on_shift_rep_count;

    return {
      locationName: location,
      open: on_shift_rep_count > 0,
      on_shift_rep_count,
      off_shift_rep_count,
      user_count,
      max,
      out_of_hours: this.outOfHours(),
      needs_queue: !can_sign_in,
      count_in_queue,
    };
  }

  async getList(location: Location) {
    try {
      return await this.dbService.query(
        e.assert_exists(
          e.select(e.sign_in.List, (user) => ({
            ...e.sign_in.List["*"],
            location: false,
            sign_ins: {
              ...e.sign_in.SignIn["*"],
              location: false,
              reason: {
                ...e.sign_in.SignInReason["*"],
              },
              user: {
                ...PartialUserProps(user),
                ...e.is(e.users.Rep, {
                  teams: { name: true, description: true, id: true },
                }),
              },
            },
            queued: {
              ...e.sign_in.QueuePlace["*"],
              location: false,
              user: PartialUserProps(user),
            },
            filter_single: {
              location: castLocation(location),
            },
          })),
        ),
      );
    } catch (error) {
      if (error instanceof InvalidValueError) {
        throw new NotFoundException(`${location} is not a known location`);
      }
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async signOutAllUsers() {
    await this.dbService.query(
      e.for(
        e.select(e.sign_in.List, () => ({
          sign_ins: true,
        })).sign_ins,
        (sign_in) => {
          return e.update(sign_in, () => ({
            set: {
              ends_at: new Date(),
              signed_out: true,
            },
          }));
        },
      ),
    );
  }

  async removeUserFromQueueTask(location: Location, user: PartialUser) {
    await sleep(1000 * 60 * 15); // This isn't committed to DB but that should be fine
    await this.removeFromQueue(location, user.id);
  }

  async registerUser(location: Location, register_user: RegisterUserDto) {
    // There may be a way to do this in fewer, more atomic steps, just haven't figured out how
    let user = await this.userService.findByUsername(register_user.username);

    if (user) {
      if (user.ucard_number > 0) {
        throw new BadRequestException({
          message: `User ${register_user.ucard_number} is already registered`,
          code: ErrorCodes.already_registered,
        });
      }
    } else {
      // no user registered, fetch from ldap
      const ldapUser = await this.ldapService.lookupUsername(register_user.username);
      if (!ldapUser) {
        throw new NotFoundException({
          message: `User with username ${register_user.username} couldn't be found. Perhaps you made a typo? (it should look like fe6if)`,
          code: ErrorCodes.ldap_not_found,
        });
      }
      user = await this.userService.insertLdapUser(ldapUser);
    }

    await this.dbService.query(
      e.update(e.users.User, () => ({
        filter_single: {
          username: register_user.username,
        },
        set: {
          ucard_number: register_user.ucard_number,
        },
      })),
    );

    await this.dbService.query(
      e.insert(e.sign_in.UserRegistration, {
        location: castLocation(location),
        user: e.select(e.users.User, () => ({
          filter_single: { username: register_user.username },
        })),
      }),
    );

    await this.emailService.sendWelcomeEmail(user);
  }

  async getTrainings(id: string, location: Location): Promise<Training[]> {
    // This cannot work in TS until edgedb/edgedb-js#615 is resolved, instead just use EdgeQL directly
    const location_ = location.toUpperCase() as Uppercase<Location>;

    const { training } = await getUserTrainingForSignIn(this.dbService.client, {
      id,
      location: location_,
      location_,
      on_shift_reasons: this.outOfHours() ? [REP_ON_SHIFT, REP_OFF_SHIFT] : [REP_ON_SHIFT],
    });
    const all_training = await this.dbService.query(
      e.select(e.training.Training, (training_) => ({
        id: true,
        name: true,
        compulsory: true,
        in_person: true,
        rep: { id: true, description: true },
        description: true,
        filter: e.all(
          e.set(
            e.op(training_.id, "not in", e.cast(e.uuid, e.set(...training.map((training) => training.id)))),
            e.op("exists", training_.rep),
            e.op(e.cast(e.training.TrainingLocation, location_), "in", training_.locations),
          ),
        ),
      })),
    );
    return [...all_training, ...training];
  }

  async totalCount(location: Location): Promise<number> {
    return await this.dbService.query(
      e.count(
        e.select(e.sign_in.List, () => ({
          filter_single: {
            location: castLocation(location),
          },
        })).sign_ins,
      ),
    );
  }

  outOfHours() {
    const date = new Date();
    const current_hour = date.getHours();
    const current_day = date.getDay();

    return !(
      // TODO include term dates here/have some way to set this
      (12 <= current_hour && current_hour < 20 && ![0, 6].includes(current_day))
    );
  }

  async maxCount(location: Location): Promise<number> {
    const out_of_hours = this.outOfHours();
    let on_shift = await this.onShiftReps(location);
    if (out_of_hours) {
      // on/off-shift doesn't matter towards the count out of hours it's purely for if the doorbell is outside
      on_shift += await this.offShiftReps(location);
    }
    const factor = out_of_hours ? OUT_OF_HOURS_RATIO : IN_HOURS_RATIO;
    return Math.min(on_shift * factor, this.maxUsersForLocation(location)) + on_shift;
  }

  async offShiftReps(location: Location): Promise<number> {
    return await this.dbService.query(
      e.count(
        e.select(e.sign_in.List, () => ({
          sign_ins: (sign_in) => ({
            filter: e.op(
              e.op(sign_in.user.__type__.name, "=", "users::Rep"),
              "and",
              e.op(sign_in.reason.name, "=", REP_OFF_SHIFT),
            ),
          }),
          filter_single: {
            location: castLocation(location),
          },
        })).sign_ins,
      ),
    );
  }

  async onShiftReps(location: Location): Promise<number> {
    return await this.dbService.query(
      e.count(
        e.select(e.sign_in.List, () => ({
          sign_ins: (sign_in) => ({
            filter: e.op(
              e.op(sign_in.user.__type__.name, "=", "users::Rep"),
              "and",
              e.op(sign_in.reason.name, "=", REP_ON_SHIFT),
            ),
          }),
          filter_single: {
            location: castLocation(location),
          },
        })).sign_ins,
      ),
    );
  }

  async countInQueue(location: Location): Promise<number> {
    return await this.dbService.query(
      e.count(
        e.select(e.sign_in.List, () => ({
          filter_single: {
            location: castLocation(location),
          },
        })).queued,
      ),
    );
  }

  async canSignIn(location: Location): Promise<boolean> {
    const total_count = await this.totalCount(location);

    let on_shift = await this.onShiftReps(location);
    const off_shift = await this.offShiftReps(location);

    if (this.outOfHours()) {
      // on/off-shift doesn't matter towards the count out of hours it's purely for if the doorbell is outside
      on_shift += off_shift;
    }

    if (total_count - on_shift > this.maxUsersForLocation(location)) {
      // the hard cap assuming you're signing in as a user, on shift reps skip this check
      return false;
    }

    return (await this.maxCount(location)) + on_shift - total_count >= 0;
  }

  maxUsersForLocation(location: Location) {
    switch (location.toLowerCase()) {
      case "mainspace":
        return 45;
      case "heartspace":
        return 12;
      default:
        return 0;
    }
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
  async signIn(location: Location, ucard_number: number, tools: string[], reason_id: string) {
    const { infractions } = await this.preSignInChecks(location, ucard_number);
    if (infractions.length !== 0) {
      throw new BadRequestException({
        message: `User ${ucard_number} has active infractions ${infractions}`,
        code: ErrorCodes.user_has_active_infractions,
      });
    }
    const { reason } = await this.verifySignInReason(reason_id, ucard_number);

    let user: std.BaseObject;
    try {
      user = await this.dbService.query(
        e.insert(e.sign_in.SignIn, {
          location: castLocation(location),
          user: e.assert_exists(
            e.select(e.users.User, () => ({
              filter_single: { ucard_number },
            })),
          ),
          tools,
          reason,
          signed_out: false,
        }).user,
      );
    } catch (error) {
      if (error instanceof CardinalityViolationError) {
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
  async verifySignInReason(reason_id: string, ucard_number: number, is_rep: boolean = false) {
    const agreements_signed = await this.dbService.query(
      e.select(e.users.User, () => ({
        filter_single: { ucard_number },
      })).agreements_signed,
    );
    // check for the user agreement
    const user_agreement = await this.dbService.query(
      e.assert_exists(
        e.select(e.sign_in.SignInReason, (reason) => ({
          filter_single: e.op(reason.category, "=", e.sign_in.SignInReasonCategory.PERSONAL_PROJECT),
        })).agreement,
      ),
    );
    if (!agreements_signed.some((agreement) => agreement.id === user_agreement.id)) {
      throw new BadRequestException("User agreement not signed.");
    }

    const query = e.assert_exists(
      e.select(e.sign_in.SignInReason, () => ({
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

  async preSignInChecks(location: Location, ucard_number: number) {
    if (await this.queueInUse(location)) {
      await this.assertHasQueued(location, ucard_number);
    } else if (!(await this.canSignIn(location))) {
      throw new HttpException(
        "Failed to sign in, we are at max capacity. Consider using the queue",
        HttpStatus.SERVICE_UNAVAILABLE,
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

  async repSignIn(location: Location, ucard_number: number, reason_id: string) {
    const { reason, reason_name } = await this.verifySignInReason(reason_id, ucard_number, /* is_rep */ true);

    if (reason_name !== REP_ON_SHIFT && !this.outOfHours()) {
      await this.preSignInChecks(location, ucard_number);
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
        e.op(e.cast(e.training.TrainingLocation, location.toUpperCase()), "in", training.locations),
      ),
    }));

    const missing = await this.dbService.query(
      e.select(e.op(compulsory, "except", user.training), () => ({ name: true, id: true })),
    );

    if (missing) {
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
          location: castLocation(location),
          user,
          tools: [],
          reason,
          signed_out: false,
        }),
      );
    } catch (error) {
      if (error instanceof CardinalityViolationError) {
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
    location: Location,
    ucard_number: number,
    tools: string[] | undefined,
    reason_id: string | undefined,
  ) {
    const { reason } = reason_id ? await this.verifySignInReason(reason_id, ucard_number) : { reason: undefined };

    try {
      await this.dbService.query(
        e.update(e.sign_in.SignIn, (sign_in) => {
          const isCorrectLocation = e.op(sign_in.location, "=", castLocation(location));
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
      );
    } catch (e) {
      if (e instanceof CardinalityViolationError && e.code === 84017154) {
        console.log(e, e.code);
        throw e; // user not previously signed in
      }
      throw e;
    }
  }

  async signOut(location: Location, ucard_number: number) {
    try {
      await this.dbService.query(
        e.assert_exists(
          e.update(e.sign_in.SignIn, (sign_in) => {
            const isCorrectLocation = e.op(sign_in.location, "=", castLocation(location));
            const userMatches = e.op(sign_in.user.ucard_number, "=", ucard_number);
            const doesNotExist = e.op("not", e.op("exists", sign_in.ends_at));

            return {
              filter_single: e.all(e.set(isCorrectLocation, userMatches, doesNotExist)),
              set: {
                ends_at: new Date(),
                signed_out: true,
              },
            };
          }),
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
    if (await this.canSignIn(location)) {
      await this.unqueueTop(location);
    }
  }

  // queue management

  /* Are there people queuing currently or has it been manually disabled */
  async queueInUse(location: Location) {
    if (this.disabledQueue.has(location)) {
      throw new HttpException("Queue has been manually disabled", HttpStatus.SERVICE_UNAVAILABLE);
    }
    const queuing = await this.dbService.query(
      e.select(e.sign_in.QueuePlace, (place) => ({
        filter: e.op(place.location, "=", castLocation(location)),
        limit: 1,
      })),
    );
    return queuing.length !== 0;
  }

  async assertHasQueued(location: Location, ucard_number: number) {
    const users_can_sign_in = await this.queuedUsersThatCanSignIn(location);

    if (
      !users_can_sign_in.find((user) => {
        return user.ucard_number === ucard_number;
      })
    ) {
      throw new HttpException(
        {
          message: "Failed to sign in, we are still waiting for people who have been queued to show up",
          code: ErrorCodes.not_in_queue,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async unqueueTop(location: Location) {
    const queuedUsers = await this.dbService.query(
      e.select(e.sign_in.QueuePlace, (queue_place) => ({
        user: PartialUserProps(queue_place.user),
        filter: e.op(
          e.op(queue_place.location, "=", castLocation(location)),
          "and",
          e.op(queue_place.can_sign_in, "=", false),
        ),
        limit: 1,
        order_by: {
          expression: queue_place.position,
          direction: e.ASC,
        },
      })),
    );
    if (queuedUsers.length !== 0) {
      const topUser = queuedUsers[0];
      await this.emailService.sendUnqueuedEmail(topUser.user, location);
      this.removeUserFromQueueTask(location, topUser.user).catch();
    }
  }

  async addToQueue(location: Location, ucard_number: number): Promise<void>;
  async addToQueue(location: Location, ucard_number: undefined, user_id: string): Promise<void>;
  async addToQueue(location: Location, ucard_number: number | undefined, user_id: string | undefined = undefined) {
    if (!(await this.queueInUse(location))) {
      throw new HttpException("The queue is currently not in use", HttpStatus.BAD_REQUEST);
    }

    try {
      e.insert(e.sign_in.QueuePlace, {
        user: e.select(e.users.User, () => ({
          filter_single: ucard_number ? { ucard_number } : { id: user_id! }, // on the off chance the user hasn't been registered yet, use their ID
        })),
        location: castLocation(location),
        position: e.op(e.count(e.select(e.sign_in.QueuePlace)), "+", 1),
      });
    } catch (e) {
      if (e instanceof CardinalityViolationError && e.code === 84017154) {
        console.log(e, e.code);
        throw e; // user already in queue
      }
      throw e;
    }
  }

  async removeFromQueue(location: Location, user_id: string) {
    // again, user_id because might not have ucard_number
    if (await this.queueInUse(location)) {
      throw new HttpException("The queue is currently not in use", HttpStatus.SERVICE_UNAVAILABLE);
    }

    await this.dbService.query(
      e.delete(e.sign_in.QueuePlace, (queue_place) => ({
        filter: e.op(queue_place.user.id, "=", e.cast(e.uuid, user_id)),
      })),
    );

    await this.dbService.query(
      e.update(e.sign_in.QueuePlace, (queue_place) => ({
        filter: e.op(queue_place.location, "=", castLocation(location)),
        set: {
          position: e.op(queue_place.position, "-", 1),
        },
      })),
    );
  }

  async queuedUsersThatCanSignIn(location: Location) {
    const queue_places = await this.dbService.query(
      e.select(e.sign_in.QueuePlace, (queue_place) => ({
        user: PartialUserProps(queue_place.user),
        filter: e.op(
          e.op(queue_place.location, "=", e.cast(e.sign_in.SignInLocation, castLocation(location))),
          "and",
          e.op(queue_place.can_sign_in, "=", true),
        ),
      })),
    );
    return queue_places.map((queue_place) => queue_place.user);
  }

  async getSignInReasons() {
    // TODO in future would be nice to only return options that a user is part of due to
    // - Their course
    // - SU clubs
    // - CCAs
    return await this.dbService.query(
      e.select(e.sign_in.SignInReason, () => ({ ...e.sign_in.SignInReason["*"], agreement: true })),
    );
  }

  async addSignInReason(reason: CreateSignInReasonCategoryDto) {
    return await this.dbService.query(
      e.select(
        e.insert(e.sign_in.SignInReason, {
          ...reason, // for some reason this works but just passing it directly doesn't
        }),
        () => e.sign_in.SignInReason["*"],
      ),
    );
  }

  async deleteSignInReason(id: string) {
    return await this.dbService.query(
      e.delete(e.sign_in.SignInReason, () => ({
        filter_single: { id },
      })),
    );
  }

  async getSignInReasonsLastUpdate() {
    return await this.dbService.query(
      e.assert_exists(
        e.assert_single(
          e.select(e.sign_in.SignInReason, (sign_in) => ({
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
}
