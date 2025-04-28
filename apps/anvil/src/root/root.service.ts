import { createHash } from "crypto";
import { EdgeDBService } from "@/edgedb/edgedb.service";
import { LOCATIONS, SignInService } from "@/sign-in/sign-in.service";
import { PartialUserProps } from "@/users/users.service";
import e from "@dbschema/edgeql-js";
import type { Agreement } from "@ignis/types/root";
import type { LocationName, PartialLocation } from "@ignis/types/sign_in";
import type { User } from "@ignis/types/users";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CardinalityViolationError, InvalidValueError } from "edgedb";
import { std } from "@dbschema/interfaces";

// Helper function to compute SHA-256 hash of string
function computeHash(string: string) {
  const hash = createHash("sha256");
  hash.update(string);
  return hash.digest("hex"); // Returns the hash in hexadecimal format
}

@Injectable()
export class RootService {
  async giveAgreements() {
    for (const id of [
      "8269bfca-2487-11f0-8e5f-97993a8db958",
      "8269bfca-2487-11f0-8e5f-97993a8db958",
      "55b650f6-2487-11f0-8e5f-9b36f766faa8",
    ]) {
      await this.signAgreement("5f0c60d4-f86c-11ee-8cfe-2b55746f63b3", {id})
      await this.signAgreement("5f192486-f86c-11ee-8cfe-1b52ec66a1e0", {id})
    }
  }
  constructor(
    private readonly signInService: SignInService,
    private readonly dbService: EdgeDBService,
  ) {}

  async getSignIn(id: string) {
    try {
      return await this.dbService.query(
        e.assert_exists(
          e.select(e.sign_in.SignIn, (sign_in) => ({
            ...e.sign_in.SignIn["*"],
            location: { name: true },
            user: PartialUserProps,
            reason: e.sign_in.Reason["*"],
            duration_: e.duration_to_seconds(sign_in.duration),
            filter_single: { id },
          })),
        ),
      );
    } catch (error) {
      if (error instanceof CardinalityViolationError || error instanceof InvalidValueError) {
        throw new NotFoundException(`No sign in found with ID ${id}`);
      }
      throw error;
    }
  }

  async getAgreements(): Promise<Agreement[]> {
    return await this.dbService.query(
      e.select(e.sign_in.Reason.agreement, (agreement) => ({
        filter: e.op("exists", agreement),
        id: true,
        name: true,
        created_at: true,
        updated_at: true,
        version: true,
        content: true,
        reasons: {
          name: true,
        },
      })),
    );
  }

  async getStatus(): Promise<{ [K in LocationName]: PartialLocation }> {
    return Object.fromEntries(
      await Promise.all(
        LOCATIONS.map(async (location) => {
          return [location, await this.signInService.getLocationStatus(location)];
        }),
      ),
    );
  }

  async getAgreement(id: string) {
    try {
      return this.dbService.query(
        e.select(e.sign_in.Agreement, () => ({
          ...e.sign_in.Agreement["*"],
          filter_single: { id },
        })),
      );
    } catch (error) {
      if (error instanceof InvalidValueError || error instanceof CardinalityViolationError) {
        throw new NotFoundException(`Agreement with id ${id} not found`, {
          cause: error.toString(),
        });
      }
      throw error;
    }
  }

  async createAgreement(name: string, reason_ids: string[], content: string) {
    const agreement = e.insert(e.sign_in.Agreement, { name, content });

    // update each SignInReason to link to the new Agreement
    return await this.dbService.query(
      e.assert_exists(
        e.assert_single(
          e.select(
            e.for(e.cast(e.uuid, e.set(...reason_ids)), (reason_id) => {
              return e.update(e.sign_in.Reason, () => ({
                filter_single: { id: reason_id },
                set: {
                  agreement,
                },
              }));
            }).agreement,
            () => ({ limit: 1 }),
          ),
        ),
      ),
    );
  }

  async updateAgreement(agreement_id: string, name: string, reason_ids: string[], content: string) {
    const current_agreement = e.assert_exists(
      e.select(e.sign_in.Agreement, () => ({
        filter_single: { id: agreement_id },
      })),
    );

    try {
      await this.dbService.query(
        e.update(e.sign_in.Reason, (reason) => ({
          filter: e.op(reason.agreement.id, "=", current_agreement.id),
          set: {
            agreement: null, // unlink all old agreements
          },
        })),
      );
    } catch (error) {
      if (error instanceof InvalidValueError || error instanceof CardinalityViolationError) {
        throw new NotFoundException(`Agreement with id ${agreement_id} not found`, {
          cause: error.toString(),
        });
      }
      throw error;
    }

    const new_agreement = e.insert(e.sign_in.Agreement, {
      name,
      content,
      version: e.op(current_agreement.version, "+", 1),
    });

    try {
      // Then, update each SignInReason to link to the new Agreement
      await this.dbService.query(
        e.for(e.cast(e.uuid, e.set(...reason_ids)), (reason_id) =>
          e.update(e.sign_in.Reason, () => ({
            filter_single: { id: reason_id },
            set: {
              agreement: new_agreement,
            },
          })),
        ),
      );
    } catch (error) {
      if (error instanceof InvalidValueError || error instanceof CardinalityViolationError) {
        throw new NotFoundException(`Reason with id ${agreement_id} not found`, {
          cause: error.toString(),
        });
      }
      throw error;
    }
  }

  async signAgreement(id: string, user: std.BaseObject) {
    try {
      await this.dbService.query(
        e.update(e.users.User, () => ({
          filter_single: { id: user.id },
          set: {
            agreements_signed: {
              "+=": e.select(e.sign_in.Agreement, (agreement) => ({
                filter_single: { id },
                "@version_signed": agreement.version,
              })),
            },
          },
        })),
      );
    } catch (error) {
      if (error instanceof InvalidValueError || error instanceof CardinalityViolationError) {
        throw new NotFoundException(`Agreement with id ${id} not found`, {
          cause: error.toString(),
        });
      }
      throw error;
    }
  }

  async getTeams() {
    const unassignableTeams = e.set("Staff", "?");
    return await this.dbService.query(
      e.select(e.team.Team, (team) => ({
        name: true,
        description: true,
        id: true,
        filter: e.op(team.name, "not in", unassignableTeams),
      })),
    );
  }
}
