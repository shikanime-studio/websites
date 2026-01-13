import { z } from "zod";
import { CardDataSchema } from "../components/Card";
import type { CardData } from "../components/Card";

const CardDataArraySchema = z.array(CardDataSchema);

export const fetchMerchs = async (): Promise<Array<CardData>> => {
  const res = await fetch("/api/merchs");
  return CardDataArraySchema.parse(await res.json());
};

export const fetchArtists = async (): Promise<Array<CardData>> => {
  const res = await fetch("/api/artists");
  return CardDataArraySchema.parse(await res.json());
};

export const fetchEvents = async (): Promise<Array<CardData>> => {
  const res = await fetch("/api/events");
  return CardDataArraySchema.parse(await res.json());
};

export const fetchCharacters = async (): Promise<Array<CardData>> => {
  const res = await fetch("/api/characters");
  return CardDataArraySchema.parse(await res.json());
};

export const fetchShowcases = async (): Promise<Array<CardData>> => {
  const res = await fetch("/api/showcases");
  return CardDataArraySchema.parse(await res.json());
};
