import { GoogleUser } from "@/auth/interfaces/google-user.interface";
import { LdapUser } from "@/auth/interfaces/ldap-user.interface";
import { EdgeDBService } from "@/edgedb/edgedb.service";
import { LdapService } from "@/ldap/ldap.service";
import { ErrorCodes } from "@/shared/constants/ErrorCodes";
import { ldapLibraryToUcardNumber, removeDomain } from "@/shared/functions/utils";
import e from "@dbschema/edgeql-js";
import { addInPersonTraining } from "@dbschema/queries/addInPersonTraining.query";
import { users } from "@ignis/types";
import { LocationName } from "@ignis/types/sign_in";
import { Rep, RepStatus, SignInStat, Training, User } from "@ignis/types/users";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CardinalityViolationError, ConstraintViolationError, Duration, InvalidValueError } from "edgedb";
import {
  AddInPersonTrainingDto,
  CreateInfractionDto,
  CreateUserDto,
  RevokeTrainingDto,
  UpdateUserDto,
} from "./dto/users.dto";

export const PartialUserProps = e.shape(e.users.User, () => ({
  // Fairly minimal, useful for templating
  id: true,
  pronouns: true,
  email: true,
  display_name: true,
  username: true,
  ucard_number: true,
  profile_picture: true,
  created_at: true,
  roles: { id: true, name: true },
}));
export const UserProps = e.shape(e.users.User, () => ({
  // TODO use double splat when it's available edgedb/edgedb-js#558
  ...e.users.User["*"],
  agreements_signed: {
    id: true,
    created_at: true,
    "@created_at": true,
    version: true,
  },
  referrals: true,
  roles: { id: true, name: true },
  permissions: true,
  mailing_list_subscriptions: true,
}));
const RepProps = e.shape(e.users.Rep, (rep) => ({
  ...UserProps(rep),
  status: true,
  teams: { id: true, name: true },
}));
export const TrainingProps = e.shape(e.training.Training, () => ({
  id: true,
  name: true,
  description: true,
  compulsory: true,
  in_person: true,
  locations: true,
  enabled: true,
  "@created_at": true,
  "@in_person_created_at": true,
  rep: true,
  // "@expires": true,
}));

interface UserTrainingEntryPropsOptions {
  include_fully_complete?: boolean;
  training_id?: string;
}
const UserTrainingEntry = (id: string, options: UserTrainingEntryPropsOptions) => {
  // TODO ignore trainings that are purely informational, needs a new flag adding to Training entry
  return e.shape(e.users.User, () => ({
    training: (training) => ({
      filter: e.all(
        e.set(
          options.training_id ? e.op(training.id, "=", e.uuid(options.training_id)) : true,
          e.op(
            "not",
            e.op(
              // should be e.op(training["@expires"], "<", e.datetime_of_statement())
              e.op(e.op(training["@created_at"], "+", training.expires_after), "<", e.datetime_of_statement()),
              "if",
              e.op("exists", training.expires_after),
              "else",
              false,
            ),
          ),
          options.include_fully_complete
            ? true
            : e.op(
                e.op(
                  e.op("not", e.op("exists", training["@in_person_created_at"])),
                  "and",
                  e.op("exists", training["@created_at"]),
                ),
                "if",
                training.in_person,
                "else",
                true,
              ),
        ),
      ),
    }),
    filter_single: { id },
  }));
};

@Injectable()
export class UsersService {
  constructor(
    private readonly dbService: EdgeDBService,
    private readonly ldapService: LdapService,
  ) {}

  /** Insert a user into the database. Take extra care that the ucard_number is a valid thing to insert */
  async create(
    createUserDto: Omit<CreateUserDto, "ucard_number"> & {
      ucard_number: any;
      roles?: any;
    },
  ): Promise<User> {
    try {
      return await this.dbService.query(e.select(e.insert(e.users.User, createUserDto), (user) => UserProps(user)));
    } catch (error) {
      if (error instanceof ConstraintViolationError && error.code === 84017153) {
        throw new ConflictException("A user registered with the same UCard number already exists", {
          cause: error.toString(),
        });
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.dbService.query(e.select(e.users.User, (user) => UserProps(user)));
  }

  async findOne(id: string): Promise<User | null> {
    return await this.dbService.query(
      e.select(e.users.User, (user) => ({
        ...UserProps(user),
        filter_single: { id },
      })),
    );
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.dbService.query(
      e.select(e.users.User, (user) => ({
        ...UserProps(user),
        filter_single: { username },
      })),
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.dbService.query(
      e.select(e.users.User, (user) => ({
        ...UserProps(user),
        filter_single: { email },
      })),
    );
  }

  async findByUcardNumber(ucard_number: number): Promise<User | null> {
    return await this.dbService.query(
      e.select(e.users.User, (user) => ({
        ...UserProps(user),
        filter_single: { ucard_number },
      })),
    );
  }

  async findRepByUcardNumber(ucard_number: number) {
    return await this.dbService.query(
      e.select(e.users.Rep, (rep) => ({
        ...RepProps(rep),
        filter_single: { ucard_number },
      })),
    );
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    try {
      await this.dbService.query(
        e.assert_exists(
          e.update(e.users.User, () => ({
            filter_single: { id },
            set: updateUserDto,
          })),
        ),
      );
    } catch (error) {
      if (error instanceof CardinalityViolationError && error.code === 84017154) {
        console.log(error.code);
        throw new NotFoundException(`User with id ${id} not found`, {
          cause: error.toString(),
        });
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.dbService.query(
        e.assert_exists(
          e.delete(e.users.User, () => ({
            filter_single: { id },
          })),
        ),
      );
    } catch (error) {
      if (error instanceof CardinalityViolationError && error.code === 84017154) {
        throw new NotFoundException(`User with id ${id} not found`, {
          cause: error.toString(),
        });
      }
      throw error;
    }
  }

  async createOrFindUser(googleUser: GoogleUser): Promise<User> {
    let user = await this.findByEmail(removeDomain(googleUser.email));
    if (!user) {
      const ldapUser = await this.ldapService.findUserByEmail(googleUser.email);
      if (!ldapUser) {
        throw new NotFoundException({
          message: `User with email ${googleUser.email} couldn't be found`,
          code: ErrorCodes.ldap_not_found,
        });
      }
      user = await this.dbService.query(
        e.assert_single(e.select(e.insert(e.users.User, this.ldapUserProps(ldapUser, googleUser.picture)), UserProps)),
      );
    }

    if (user.profile_picture !== googleUser.picture) {
      await this.dbService.query(
        e.update(e.users.User, () => ({
          set: {
            profile_picture: googleUser.picture,
          },
          filter_single: { id: user!.id },
        })),
      );
      user.profile_picture = googleUser.picture;
    }

    return user;
  }

  ldapUserProps(ldapUser: LdapUser, profile_picture: string | undefined = undefined) {
    return {
      username: ldapUser.uid,
      email: removeDomain(ldapUser.mail),
      first_name: ldapUser.givenName,
      last_name: ldapUser.sn,
      organisational_unit: ldapUser.ou,
      roles: e.select(e.auth.Role, () => ({ filter_single: { name: "User" } })),
      ucard_number: ldapLibraryToUcardNumber(ldapUser.shefLibraryNumber),
      profile_picture,
    };
  }

  async signInStats(id: string): Promise<SignInStat[]> {
    const groupings = await this.dbService.query(
      e.group(
        e.select(e.sign_in.SignIn, (sign_in) => ({
          filter: e.op(sign_in.user.id, "=", e.cast(e.uuid, id)),
        })),
        (sign_in) => ({
          id: true,
          location: { name: true },
          ends_at: true,
          created_at: true,
          duration_: e.select(e.duration_to_seconds(sign_in.duration)),
          by: { created_at: e.datetime_truncate(sign_in.created_at, "days") },
        }),
      ),
    );
    return groupings.map((group) => {
      const key = group.key.created_at!;
      const year = key.getFullYear();
      const month = (key.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-based
      const day = key.getDate().toString().padStart(2, "0"); // getDate() returns the day of the month

      return {
        day: `${year}-${month}-${day}`,
        value: group.elements.reduce(
          (previous_duration, visit) => previous_duration + Number.parseInt(visit.duration_),
          0,
        ),
        sign_ins: group.elements.map((sign_in) => ({
          ...sign_in,
          location: sign_in.location,
          duration: Number.parseInt(sign_in.duration_),
        })),
      };
    });
  }

  async getUserTraining(id: string): Promise<Training[]> {
    const { training } = await this.dbService.query(
      e.assert_exists(
        e.select(e.users.User, () => ({
          training: (training) => ({
            ...TrainingProps(training),
            rep: { id: true, description: true },
          }),
          filter_single: { id },
        })),
      ),
    );
    return training;
  }

  async getUserTrainingInPersonTrainingRemaining(id: string): Promise<users.UserInPersonTrainingRemaining[]> {
    // TODO send out emails when training is about to expire.

    return await this.dbService.query(
      e.select(
        e.assert_exists(e.select(e.users.User, UserTrainingEntry(id, { include_fully_complete: false }))).training,
        (training) => ({
          name: true,
          id: true,
          locations: true,
          filter: training.in_person,
        }),
      ),
    );
  }

  async addInPersonTraining(id: string, training_id: string, data: AddInPersonTrainingDto) {
    // pre-condition they must already have completed online training otherwise this is a no-op
    await addInPersonTraining(this.dbService.client, {
      id,
      training_id,
      ...data,
      created_at: new Date(data.created_at),
    });
  }

  async revokeTraining(id: string, training_id: string, data: RevokeTrainingDto) {
    const user = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id } })));
    await this.dbService.query(
      e.update(user, () => ({
        set: {
          training: {
            "-=": e.assert_exists(e.select(e.users.User, UserTrainingEntry(id, { training_id }))).training,
          },
          infractions: {
            "+=": e.insert(e.users.Infraction, {
              user,
              reason: data.reason,
              resolved: true,
              type: e.users.InfractionType.TRAINING_ISSUE,
            }),
          },
        },
      })),
    );
    await this.dbService.query(
      e.delete(e.training.UserTrainingSession, (session) => ({
        filter_single: e.all(
          e.set(e.op(session.training.id, "=", e.cast(e.uuid, training_id)), e.op(session.user, "=", user)),
        ),
      })),
    );
  }

  async addInfraction(id: string, data: CreateInfractionDto) {
    const user = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id } })));
    return this.dbService.query(
      e.update(user, () => ({
        set: {
          infractions: {
            "+=": e.insert(e.users.Infraction, {
              user,
              created_at: data.created_at,
              reason: data.reason,
              resolved: data.resolved,
              type: data.type,
              duration: data.duration ? new Duration(0, 0, 0, 0, data.duration) : undefined,
            }),
          },
        },
      })),
    );
  }

  async promoteUserToRep(id: string, teamIds: string[], status: RepStatus = "ACTIVE"): Promise<Rep> {
    // Assuming you have a method to check if a user is already a Rep
    const isAlreadyRep = await this.isRep(id);
    if (isAlreadyRep) {
      throw new ConflictException(`User with id ${id} is already a Rep`);
    }

    const user = e.assert_exists(e.delete(e.users.User, () => ({ filter_single: { id } })));

    try {
      return await this.dbService.query(
        e.select(
          e.insert(e.users.Rep, {
            ucard_number: user.ucard_number,
            created_at: user.created_at,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            display_name: user.display_name,
            pronouns: user.pronouns,
            organisational_unit: user.organisational_unit,
            agreements_signed: user.agreements_signed,
            permissions: user.permissions,
            infractions: user.infractions,
            mailing_list_subscriptions: user.mailing_list_subscriptions,
            referrals: user.referrals,
            training: user.training,
            roles: e.select(e.auth.Role, () => ({ filter_single: { name: "Rep" } })),
            status,
            teams: e.select(e.team.Team, (team_) => ({
              filter: e.op(team_.id, "in", e.cast(e.uuid, e.set(...teamIds))),
            })),
          }),
          (rep) => RepProps(rep),
        ),
      );
    } catch (error) {
      if (error instanceof CardinalityViolationError && error.code === 84017154) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      if (error instanceof InvalidValueError) {
        throw new NotFoundException(`Team(s) with id ${teamIds} not found`);
      }
      throw error;
    }
  }

  async isRep(user_id: string): Promise<boolean> {
    return this.dbService.query(
      e.op(
        "exists",
        e.select(e.users.Rep, () => ({
          filter_single: { id: user_id },
        })),
      ),
    );
  }

  // This is cursed and im not sure what to do but the idea is there will be an endpoint to handle updating things that will either do the promoto endpoints job(by calling old function) or it will update the existing reps teams (no idea how to edgedb tho (skill issue))
  // async manageRepTeams(user_id: string, teamIds: string[]): Promise<Rep> {
  //   const isCreatingNewRep = !(await this.isRep(user_id));
  //
  //   if (isCreatingNewRep) {
  //     return this.promoteUserToRep(user_id, teamIds);
  //   }
  //
  //   return this.dbService.query(
  //     e.update(e.users.Rep, (rep) => ({
  //       ...RepProps(rep),
  //       filter_single: { id: user_id },
  //       teams: teamIds.map((teamId) => ({ id: teamId })),
  //     })),
  //   );
  // }
}
