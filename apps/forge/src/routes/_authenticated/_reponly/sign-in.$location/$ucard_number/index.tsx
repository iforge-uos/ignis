import { EventPublisher, isDefinedError } from "@orpc/client";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { Entries } from "@packages/types";
import { Card } from "@packages/ui/components/card";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import z from "zod";
import { StepType as _StepType, UCardNumber } from "@/api/locations/$name/sign-in/_flows/_steps"; // TODO double check if this actually problematically not shaken
import type {
  Finalise as _Finalise,
  Initialise as _Initialise,
  Receive as _Receive,
  Transmit as _Transmit,
  ErrorMap,
  Graph,
} from "@/api/locations/$name/sign-in/_flows/_types";
import type { PUBLISHER as SERVER_PUBLISHER } from "@/api/locations/$name/sign-in/$ucard";
import { Hammer } from "@/components/loading";
import { client } from "@/lib/orpc";
import type { SignInUser } from "@/lib/utils/queries";
import { FlowStepComponent } from "@/types/signInActions";
import SignInStepsProvider from "@/providers/SignInSteps";
import { Finalise as FinaliseComponent } from "./-components/Finalise";
import { PersonalToolsAndMaterials } from "./-components/PersonalToolsAndMaterials";
import SignInNav from "./-components/SignInNav";
import { ReasonInput } from "./-components/SignInReasonInput";
import SigningInUserCard from "./-components/SigningInUserCard";
import { SignOut } from "./-components/SignOutDispatcher";
import { SupervisableTools } from "./-components/SupervisableTools";
import { Tools } from "./-components/ToolSelectionInput";
import { toast } from "sonner";
import Title from "/src/components/title";
import ActiveLocationSelector from "/src/components/sign-in/ActiveLocationSelector";

export type Initialise = z.infer<typeof _Initialise>;
export type Receive = z.infer<typeof _Receive>;
export type Transmit = z.infer<typeof _Transmit>;
export type Finalise = z.infer<typeof _Finalise>;
export type StepType = z.infer<typeof _StepType>;

export const PUBLISHER: typeof SERVER_PUBLISHER = new EventPublisher();
const STEP_COMPONENTS = {
  REASON: ReasonInput,
  SUPERVISABLE_TOOLS: SupervisableTools,
  PERSONAL_TOOLS_AND_MATERIALS: PersonalToolsAndMaterials,
  SIGN_OUT: SignOut,
  TOOLS: Tools,
  FINALISE: FinaliseComponent,
} as const satisfies { [K in StepType]: FlowStepComponent<K> };

export type CommonKeys = "ucard_number" | "name";
export type RMCommon<T, RMType extends boolean = true> = Omit<
  T,
  (RMType extends true ? "type" : "INTENTIONALLY_NOT_VALID_KEY") | CommonKeys
>;

// represents https://www.mermaidchart.com/play#pako:eNptVE2P2jAQ_SujHNrtAZWwsLAc2iJaVXtopbbsoWr24CQDWCR21mNDEeK_d-x88FEuiEzePL_3PJNDlOkco2nU6_USlWm1lKtpogDsGkucgkLtnwqtN6cHsdfOTmEp_2KeqNC5LPQuWwtjYfHZYwDU5JBEz4QGMqGA5EqBVJAKwhy0gleHDoGssJhER-j14Lvm3w-g4tGfJHoiMLiSZNHwGdFLy-mBv5Fq5ODwH_DYAAfnjEPGfRMbDKagMnorSWolimJfCxMrg2xX2SuC7qT4vjWjtA097ILtYEG4W_PRp8ahb5y1hOBUjoas1jkIlbetgXTEnDPagNVALqXMyLSRyJVSyEKqFRRsja7YF1pD6mhf0zxwXF_Rdp3Bkau8zwoNW-S0-R3sMCVpMciwTRqMd8b_MQh3KWbCkQeC4GcqRFli_u6U_tgL7pxla8w2VF-ejyjmt3NdVq4gbfawMEIq72DucScHcdzg-6z7JwpieU-qcpz9C7zh-pjrX4zRBnQotodfzMjwlmlpr7yeuketyFZFvykMmKiTKr0OuPN3bPDVSR4pWLIQgxW9xy27prM44vuaY-xlD_q3Zceji0F6bO5cLr3OPewEJ8n6wzqchTS6cPvw6cBbl2IxBZ54xZLKoIk5RMgAnJ9NSeqtvVgH6Agn9a78CGs3y6zcYrDm98JQJTL82F3lpG26MW3x402fFHP5l9_057kwfmMbeMflPdBaVPxRMZhZFhYd_wHo9mxr
// I'm calling this structure an adjacency object (It's a named adjacency list)
const GRAPH = {
  INITIALISE: ["AGREEMENTS", "QUEUE", "REASON", "SIGN_OUT"],
  AGREEMENTS: ["MAILING_LISTS"],
  CANCEL: [undefined],
  MAILING_LISTS: ["REASON"],
  PERSONAL_TOOLS_AND_MATERIALS: ["TOOLS"],
  QUEUE: [undefined],
  REASON: ["FINALISE", "PERSONAL_TOOLS_AND_MATERIALS", "SUPERVISABLE_TOOLS"],
  SUPERVISABLE_TOOLS: ["FINALISE"],
  TOOLS: ["FINALISE"],
  FINALISE: [undefined],
  SIGN_OUT: [undefined],
} as const satisfies Graph;

const MAIN_LINE = [
  "QUEUE",
  "REASON",
  "SUPERVISABLE_TOOLS",
  "TOOLS",
  "PERSONAL_TOOLS_AND_MATERIALS",
  "FINALISE",
  "SIGN_OUT",
] as const satisfies StepType[]; // Steps in the network graph that should be vertical

const LOADER_STEPS = new Set<StepType>(["INITIALISE"]);
export const GRAPH_ENDS = (Object.entries(GRAPH) as Entries<Graph>)
  .map(([key, value]) => (value[0] === undefined ? key : undefined))
  .filter(Boolean); // ends should invalidate at the end of their chain

export type StepToTransmitMap = { [K in StepType]: Extract<Transmit, { type: K }> };
export type StepToReceiveMap = { [K in StepType]: Extract<Receive, { type: K }> };
export type StepToFinaliseMap = { [K in StepType]: Extract<Finalise, { type: K }> };

export type ReceiveReturn<T extends StepType> =
  | {
      data: StepToFinaliseMap[T] extends never
        ? T extends "FINALISE"
          ? { id: string }
          : undefined
        : StepToFinaliseMap[T];
      error: undefined;
    }
  | { data: undefined; error: ErrorMap[T] };

const flowQuery = ({ location: name, ucard_number }: z.infer<typeof Params>) =>
  queryOptions({
    queryKey: ["sign-in-flow", name, ucard_number],
    queryFn: async ({ signal }) => {
      const commonData = {
        ucard_number,
        name,
      } satisfies Record<CommonKeys, any>;

      const key = `${name}-${ucard_number}` as const;
      const initKey = `${key}-INITIALISE` as const;
      const recvKey = `${key}-RECEIVE` as const;
      const [initialiseTx, receiveTx] = await Promise.all([
        client.locations.signIn.initialise(PUBLISHER.subscribe(initKey, { signal })),
        client.locations.signIn.receive(PUBLISHER.subscribe(recvKey, { signal })),
      ]);
      const fn = await client.locations.signIn.flow(commonData, { signal });

      // send the data to server, uses the same terminology as server
      const initialise = async <T extends RMCommon<Initialise, false>>(initialise: T) => {
        PUBLISHER.publish(initKey, { ...initialise, ...commonData });
        await initialiseTx.next(); // send it
        return (await fn.next()).value as StepToTransmitMap[T["type"]];
      };

      const receive = async <StepT extends StepType>(
        type: StepT,
        receive: Omit<StepToReceiveMap[StepT], "type" | keyof typeof commonData>,
      ): Promise<ReceiveReturn<StepT>> => {
        PUBLISHER.publish(recvKey, { ...receive, ...commonData, type } as Receive);
        await receiveTx.next(); // send it
        try {
          return {
            data: (await fn.next()).value,
            error: undefined,
          } as Extract<ReceiveReturn<StepT>, { error: undefined }>;
        } catch (error) {
          return {
            data: undefined,
            error: error as ErrorMap[StepT],
          };
        }
      };

      return {
        initialise,
        receive,
      };
    },
  });

const Params = z.object({ location: LocationNameSchema, ucard_number: UCardNumber });

export const Route = createFileRoute("/_authenticated/_reponly/sign-in/$location/$ucard_number/")({
  params: z.object({ location: LocationNameSchema, ucard_number: UCardNumber }),
  component: () => {
    const params = Route.useParams();
    const { data: { initialise, receive } = {} } = useQuery(flowQuery(params));
    const [user, setUser] = useState<SignInUser | null>(null);

    const [steps, setSteps] = useState<StepType[]>(["INITIALISE"]);
    const [transmit, setTransmit] = useState<Transmit>();
    const [finalise, setFinalise] = useState<() => Promise<void>>();
    const [canContinue, setCanContinue] = useState<boolean>(false);
    const currentStep = steps.at(-1)!;

    const nextStepRef = useRef<HTMLButtonElement | undefined>(undefined);

    const focusNextStep = () => {
      if (canContinue) nextStepRef.current!.focus();
    };

    useEffect(() => {
      (async () => {
        if (!initialise || !receive) return;

        const transmit = await initialise({ type: currentStep }).catch((err) => {
          if (isDefinedError(err) && err.code === "NOT_FOUND") {
            toast.error(err.message);
            throw redirect({ to: "/sign-in/$location", params: params });
          }
          throw err;
        }); // fire off the request for the data when the step changes
        if (transmit.type === "INITIALISE") {
          setUser(transmit.user);
          const { data: finalise } = await receive("INITIALISE", {});
          return setSteps((steps) => [...steps, finalise!.next]);
        }

        setTransmit(transmit);
        console.log("Got transmit", currentStep, transmit);
      })();
    }, [initialise, receive, params, currentStep]);

    if (
      !initialise ||
      !receive ||
      !user || // everything is still pending
      LOADER_STEPS.has(currentStep) || // don't show the initialising state
      transmit === undefined // don't show until the data is ready
    ) {
      return (
        <>
          <Title prompt="Sign In Flow" />
          <div className="m-4 space-y-5 mb-10">
            <ActiveLocationSelector disabled />
            <Hammer />{" "}
          </div>
        </>
      );
    }

    const Step = STEP_COMPONENTS[currentStep];
    console.log("Rendering step:", currentStep);

    return (
      <>
        <Title prompt="Sign In Flow" />
        <div className="m-4 space-y-5 mb-10">
          <ActiveLocationSelector disabled />
          <SigningInUserCard user={user} className="w-full " />

          <Card className="rounded-sm">
            <SignInStepsProvider
              transmit={transmit}
              _setTransmit={setTransmit}
              _continue={receive.bind(undefined, currentStep)}
              setCanContinue={setCanContinue}
              canContinue={canContinue}
              focusNextStep={focusNextStep}
              _setSteps={setSteps}
              finalise={finalise}
              _setFinalise={setFinalise as any}
            >
              <Step data={transmit} user={user} />

              <SignInNav steps={steps} setSteps={setSteps} ref={nextStepRef} />
            </SignInStepsProvider>
          </Card>
        </div>
      </>
    );
  },
  onLeave: ({ params, context: { queryClient } }) => {
    queryClient.invalidateQueries(flowQuery(params));
  },
});
