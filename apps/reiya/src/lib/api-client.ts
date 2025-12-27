import type { CardData } from "../components/Card";

export const fetchMerchs = async (): Promise<CardData[]> => {
  const res = await fetch("/api/merchs");
  return res.json();
};

export const fetchArtists = async (): Promise<CardData[]> => {
  const res = await fetch("/api/artists");
  return res.json();
};

export const fetchEvents = async (): Promise<CardData[]> => {
  const res = await fetch("/api/events");
  return res.json();
};

export const fetchCharacters = async (): Promise<CardData[]> => {
  const res = await fetch("/api/characters");
  return res.json();
};

export const fetchShowcases = async (): Promise<CardData[]> => {
  const res = await fetch("/api/showcases");
  return res.json();
};
