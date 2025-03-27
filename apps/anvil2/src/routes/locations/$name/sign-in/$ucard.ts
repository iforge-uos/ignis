import { deskOrAdmin, transaction } from "@/router";
import { ensureUser } from "@/utils/sign-in";
import e from "@dbschema/edgeql-js";
import { SignInErrors, SignInStepInput, SignInStepOutput } from "./_flows/_types";
import agreements from "./_flows/agreements";
import cancel from "./_flows/cancel";
import finalise from "./_flows/finalise";
import initialise from "./_flows/initialise";
import personalToolsAndMaterials from "./_flows/personal-tools-and-materials";
import queue from "./_flows/queue";
import reasons from "./_flows/reasons";
import register from "./_flows/register";
import tools from "./_flows/tools";

function isRep(params: { id: string } | { ucard_number: number } | { username: string }) {
  return e.op(
    "exists",
    e.select(e.users.Rep, () => ({
      filter_single: params,
    })),
  );
}

export const signIn = deskOrAdmin
  .route({ method: "POST", path: "/{ucard_number}" })
  .use(transaction)
  .input(SignInStepInput)
  .output(SignInStepOutput)
  .errors(SignInErrors)
  .handler(async (arg) => {
    const {
      input,
      context: { tx },
      signal,
    } = arg;

    const user = await ensureUser({ ...input, db: tx });

    signal?.addEventListener("abort", async () => {
      await cancel({ ...arg, input: { ...input, type: "CANCEL" }, user });
    });

    switch (input.type) {
      case "INITIALISE":
        return await initialise({ ...arg, user, input });
      case "QUEUE":
        return await queue({ ...arg, user, input });
      case "REGISTER":
        return await register({ ...arg, user, input });
      case "AGREEMENTS":
        return await agreements({ ...arg, user, input });
      case "REASON":
        return await reasons({ ...arg, user, input });
      case "TOOLS":
        return await tools({ ...arg, user, input });
      case "PERSONAL_TOOLS_AND_MATERIALS":
        return await personalToolsAndMaterials({ ...arg, user, input });
      case "FINALISE":
        return await finalise({ ...arg, user, input });
      case "CANCEL":
        return await cancel({ ...arg, user, input });
    }
  });

// async function preSignInChecks(location: LocationName, ucard_number: number, post: boolean = false) {
//   if ((await this.getAvailableCapacity(location)) <= 0) {
//     if (await this.queueInUse(location)) {
//       this.logger.log(
//         `Queue in use, Checking if user: ${ucard_number} has queued at location: ${location}`,
//         SignInService.name,
//       );
//       await this.assertHasQueued(location, ucard_number);
//     } else {
//       throw new HttpException(
//         "Failed to sign in, we are at max capacity. Consider using the queue",
//         HttpStatus.SERVICE_UNAVAILABLE,
//       );
//     }
//   }
//   if (post) {
//     // try and delete them from the queue if they're signing in for real
//     await this.dbService.query(
//       e.delete(e.sign_in.QueuePlace, (place) => ({
//         filter_single: e.op(place.user.ucard_number, "=", ucard_number),
//       })),
//     );
//   }

//   const user = await this.dbService.query(
//     e.select(e.users.User, () => ({
//       filter_single: { ucard_number },
//       infractions: { type: true, duration: true, reason: true, resolved: true, id: true, created_at: true },
//     })),
//   );
//   if (!user) {
//     throw new NotFoundException({
//       message: `User with UCard number ${ucard_number} is not registered`,
//       code: ErrorCodes.not_registered,
//     });
//   }
//   const { infractions } = user;
//   const active_infractions = infractions.filter((infraction) => infraction.resolved); // the final boss of iForge rep'ing enters
//   return { infractions: active_infractions };
// }

// async function repSignIn(db: Client, name: LocationName, ucard_number: number, reason_id: string) {
//   const { reason, reason_name } = await this.verifyReason(reason_id, ucard_number);

//   if (reason_name !== REP_ON_SHIFT && !(await LocationParams.out_of_hours.run(db, { name }))) {
//     await this.preSignInChecks(name, ucard_number, /* post */ true);
//   }

//   // TODO this should be client side?
//   const user = e.assert_exists(
//     e.select(e.users.Rep, () => ({
//       filter_single: { ucard_number },
//     })),
//   );

//   const missing = await this.dbService.query(
//     e.select(e.op(compulsory, "except", user.training), () => ({ name: true, id: true })),
//   );

//   if (missing.length > 0) {
//     throw new BadRequestException({
//       message: `Rep hasn't completed compulsory on shift-trainings. Missing: ${missing
//         .map((training) => training.name)
//         .join(", ")}`,
//       code: ErrorCodes.compulsory_training_missing,
//     });
//   }

//   try {
//     return await e
//       .insert(e.sign_in.SignIn, {
//         location: LocationParams,
//         user,
//         tools: [],
//         reason,
//       })
//       .run(db, { name });
//   } catch (error) {
//     if (error instanceof ConstraintViolationError) {
//       throw new BadRequestException({
//         message: `Rep ${ucard_number} already signed in`,
//         code: ErrorCodes.already_signed_in_to_location,
//       });
//     }
//     if (error instanceof InvalidValueError) {
//       throw new BadRequestException(
//         {
//           message: `User ${ucard_number} attempting to sign in is not a rep`,
//           code: ErrorCodes.not_rep,
//         },
//         { cause: error.toString() },
//       );
//     }
//     throw error;
//   }
// }

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
