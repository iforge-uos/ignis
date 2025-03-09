import email from "@/email";
import ldap from "@/ldap";
import { auth, deskOrAdmin, rep } from "@/router";
import { LocationParams } from "@/utils/queries";
import { ensureUser, ldapLibraryToUcardNumber } from "@/utils/sign-in";
import { CreateSignInSchema, LocationNameSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e from "@dbschema/edgeql-js";
import { users } from "@ignis/types";
import { SignIn } from "@ignis/types/root";
import { Location, LocationName } from "@ignis/types/sign_in";
import { User } from "@ignis/types/users";
import { Client } from "gel";
import { z } from "zod";

export const signInInfo = auth
  .route({ path: "/{ucard_number}" })
  .input(z.object({ name: LocationNameSchema, ucard_number: z.string().regex(/\d{9,}/) }))
  .handler(async ({ input, ctx: { db } }) => {
    const { user, name } = await ensureUser({ input, ctx: { db } }); // FIXME this has to do something different or store the knowledge that they just registered. If the signing in rep misses the prompt we are shit outta luck? Can we hold back registering till theyre on the line?
    if (user?.location && user.location !== name) {
      throw new TRPCError({
        message: "User is already signed in at a different location, please sign out there before signing in.",
        code: "BAD_REQUEST",
      });
    }
    return user;
  });

function isRep(params: { id: string } | { ucard_number: number } | { username: string }) {
  return e.op(
    "exists",
    e.select(e.users.Rep, () => ({
      filter_single: params,
    })),
  );
}

export type Step = "REGISTER" | "QUEUE" | "AGREEMENTS" | "REASON" | "TRAINING";

const signIn = deskOrAdmin
  .input(
    z.object({
      name: LocationNameSchema,
      ucard_number: z.string().regex(/\d{9,}/),
      data: CreateSignInSchema.extend({
        reason_id: z.string(),
      }),
    }),
  )
  .route({ method: "POST", path: "/{ucard_number}" })
  .handler(async ({ input, ctx: { db, logger } }) => {
    const { user, name, data } = await ensureUser({ input, ctx: { db } });
    logger.info(`Signing in UCard number: ${input.ucard_number} at location: ${name}`);
    if (user.is_rep) {
      return {
        step: 2,
      };
    }
  });

async function preSignInChecks(location: LocationName, ucard_number: number, post: boolean = false) {
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

async function repSignIn(db: Client, name: LocationName, ucard_number: number, reason_id: string) {
  const { reason, reason_name } = await this.verifyReason(reason_id, ucard_number);

  if (reason_name !== REP_ON_SHIFT && !(await LocationParams.out_of_hours.run(db, { name }))) {
    await this.preSignInChecks(name, ucard_number, /* post */ true);
  }

  // TODO this should be client side?
  const user = e.assert_exists(
    e.select(e.users.Rep, () => ({
      filter_single: { ucard_number },
    })),
  );

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
    return await e
      .insert(e.sign_in.SignIn, {
        location: LocationParams,
        user,
        tools: [],
        reason,
      })
      .run(db, { name });
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
}

// @Patch("sign-in/:ucard_number")
// @IsRep()
// async updateVisitPurpose(
//   @Param("location") location: LocationName,
//   @Param("ucard_number", ParseIntPipe) ucard_number: number,
//   @Body() updateSignInDto: UpdateSignInDto,
// ) {
//   this.logger.log(
//     `Updating visit purpose for UCard number: ${ucard_number} at location: ${location}`,
//     SignInController.name,
//   );

//   return await this.signInService.updateVisitPurpose(
//     location,
//     ucard_number,
//     updateSignInDto.tools,
//     updateSignInDto.reason_id,
//   );
// }

// @Post("sign-out/:ucard_number")
// @IsRep()
// @UseInterceptors(IdempotencyCacheInterceptor)
// @IdempotencyCache(60)
// async signOut(@Param("location") location: LocationName, @Param("ucard_number") ucard_number: string) {
//   this.logger.log(`Signing out UCard number: ${ucard_number} at location: ${location}`, SignInController.name);
//   return await this.signInService.signOut(location, ldapLibraryToUcardNumber(ucard_number));
// }
