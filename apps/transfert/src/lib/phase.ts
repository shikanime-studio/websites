import { Data } from "effect";

/** One upload-flow phase. */
export type Phase = Data.TaggedEnum<{
  // eslint-disable-next-line ts/no-empty-object-type -- Data.taggedEnum requires {} members
  Idle: {};
  // eslint-disable-next-line ts/no-empty-object-type -- Data.taggedEnum requires {} members
  Uploading: {};
  Done: { readonly url: string };
  Error: { readonly message: string };
}>;

// eslint-disable-next-line ts/no-redeclare -- Data.taggedEnum pattern: value mirrors the type
export const Phase = Data.taggedEnum<Phase>();

const phaseError = Phase.Error;

export type PhaseEvent =
  | { readonly _tag: "pick"; readonly size: number; readonly maxBytes: number }
  | { readonly _tag: "linkReady"; readonly url: string }
  | { readonly _tag: "fail"; readonly message: string }
  | { readonly _tag: "reset" };

/** Pure phase machine: every UI event maps to the next phase. */
export function reduce(_phase: Phase, event: PhaseEvent): Phase {
  switch (event._tag) {
    case "pick":
      return event.size > event.maxBytes
        ? phaseError({ message: "File too large." })
        : Phase.Uploading();
    case "linkReady":
      return Phase.Done({ url: event.url });
    case "fail":
      return phaseError({ message: event.message });
    case "reset":
      return Phase.Idle();
  }
}
