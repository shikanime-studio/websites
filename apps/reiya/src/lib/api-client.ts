import type { CardData } from "../components/Card";

export const fetchMerchs = async (): Promise<Array<CardData>> => {
  const res = await fetch("/api/merchs");
  return res.json();
};

export const fetchArtists = async (): Promise<Array<CardData>> => {
  const res = await fetch("/api/artists");
  return res.json();
};

export const fetchEvents = async (): Promise<Array<CardData>> => {
  const res = await fetch("/api/events");
  return res.json();
};

export const fetchCharacters = async (): Promise<Array<CardData>> => {
  const res = await fetch("/api/characters");
  return res.json();
};

export const fetchShowcases = async (): Promise<Array<CardData>> => {
  const res = await fetch("/api/showcases");
  return res.json();
};
