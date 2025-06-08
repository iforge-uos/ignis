import { useORPC } from "@/hooks/userORPC";
import { exhaustiveGuard } from "@/lib/utils";
import { EventPublisher } from "@orpc/client";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod/v4";
import type {
  Graph,
  SignInStepInput as _SignInStepInput,
} from "../../../anvil/src/routes/locations/$name/sign-in/_flows/_types";

type SignInStepInput = z.infer<typeof _SignInStepInput>;
const publisher = new EventPublisher<Record<string, SignInStepInput>>();

// represents https://www.mermaidchart.com/play#pako:eNptVE2P2jAQ_SujHNrtAZWwsLAc2iJaVXtopbbsoWr24CQDWCR21mNDEeK_d-x88FEuiEzePL_3PJNDlOkco2nU6_USlWm1lKtpogDsGkucgkLtnwqtN6cHsdfOTmEp_2KeqNC5LPQuWwtjYfHZYwDU5JBEz4QGMqGA5EqBVJAKwhy0gleHDoGssJhER-j14Lvm3w-g4tGfJHoiMLiSZNHwGdFLy-mBv5Fq5ODwH_DYAAfnjEPGfRMbDKagMnorSWolimJfCxMrg2xX2SuC7qT4vjWjtA097ILtYEG4W_PRp8ahb5y1hOBUjoas1jkIlbetgXTEnDPagNVALqXMyLSRyJVSyEKqFRRsja7YF1pD6mhf0zxwXF_Rdp3Bkau8zwoNW-S0-R3sMCVpMciwTRqMd8b_MQh3KWbCkQeC4GcqRFli_u6U_tgL7pxla8w2VF-ejyjmt3NdVq4gbfawMEIq72DucScHcdzg-6z7JwpieU-qcpz9C7zh-pjrX4zRBnQotodfzMjwlmlpr7yeuketyFZFvykMmKiTKr0OuPN3bPDVSR4pWLIQgxW9xy27prM44vuaY-xlD_q3Zceji0F6bO5cLr3OPewEJ8n6wzqchTS6cPvw6cBbl2IxBZ54xZLKoIk5RMgAnJ9NSeqtvVgH6Agn9a78CGs3y6zcYrDm98JQJTL82F3lpG26MW3x402fFHP5l9_057kwfmMbeMflPdBaVPxRMZhZFhYd_wHo9mxr
const GRAPH = {
  INITIALISE: ["AGREEMENTS", "QUEUE", "REASON", "SIGN_OUT"],
  AGREEMENTS: ["MAILING_LISTS"],
  CANCEL: ["DONE"],
  MAILING_LISTS: ["AGREEMENTS"],
  PERSONAL_TOOLS_AND_MATERIALS: ["FINALISE"],
  QUEUE: ["FINALISE"],
  REASON: ["FINALISE", "TOOLS"],
  REGISTER: ["PROVISIONAL_AGREEMENT"],
  TOOLS: ["FINALISE"],
  FINALISE: [],
} as const satisfies Graph;

export const Route = createFileRoute("/")({
  component: async () => {
    const uCardNumber = "";
    const locationName = "MAINSPACE" as const;
    const orpc = useORPC();
    let previous: SignInStepInput | undefined = undefined;
    const commonData = {
      ucard_number: uCardNumber,
      name: locationName,
    };

    // Function to send the data to the client, adds to queue for processing
    const send = (data: Omit<SignInStepInput, "ucard_number" | "name" | "previous">) => {
      const newData = {
        ...data,
        ...commonData,
        previous,
      };
      publisher.publish(
        uCardNumber,
        // @ts-ignore: it lies
        newData,
      );
      // @ts-ignore: again it lies
      previous = newData;
    };
    orpc.locations.signIn.send.call(
      (async function* () {
        for await (const data of publisher.subscribe(uCardNumber)) {
          yield data;
        }
      })(),
    );

    const creator = await orpc.locations.signIn.create.call(commonData);
    send({ type: "INITIALISE" });
    for await (const message of creator) {
      switch (message.currentType) {
        case "INITIALISE":
          message.user;

          break;
        default:
          exhaustiveGuard(message);
      }
    }
  },
});
