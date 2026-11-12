import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";

export const ImageRef = Schema.Struct({
  src: Schema.String,
  width: Schema.Number,
  height: Schema.Number,
});

const CardStatus = Schema.Literals(["OPEN", "CLOSED", "WAITLIST"]);

export const CardData = Schema.Struct({
  id: Schema.Union([Schema.String, Schema.Number]),
  title: Schema.String,
  status: CardStatus,
  href: Schema.String,
  images: Schema.Array(ImageRef),
  artist: Schema.Struct({
    name: Schema.String,
    avatar: ImageRef,
    verified: Schema.optional(Schema.Boolean),
    level: Schema.optional(Schema.Number),
  }),
  rating: Schema.Number,
  reviewCount: Schema.Number,
  price: Schema.optional(Schema.String),
});

export const Category = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  icon: Schema.NullOr(Schema.String),
});

export const SessionUser = Schema.Struct({
  name: Schema.String,
  email: Schema.String,
  image: Schema.NullOr(Schema.optional(Schema.String)),
});

export type Card = (typeof CardData)["Type"];
export type CardList = readonly Card[];
export type Session = (typeof SessionUser)["Type"];

export const group = RpcGroup.make(
  Rpc.make("getCategories", { success: Schema.Array(Category) }),
  Rpc.make("getSessionUser", { success: Schema.NullOr(SessionUser) }),
  Rpc.make("getMerchs", { success: Schema.Array(CardData) }),
  Rpc.make("getArtists", { success: Schema.Array(CardData) }),
  Rpc.make("getEvents", { success: Schema.Array(CardData) }),
  Rpc.make("getCharacters", { success: Schema.Array(CardData) }),
  Rpc.make("getShowcases", { success: Schema.Array(CardData) }),
);
