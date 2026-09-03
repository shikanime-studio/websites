import type { APIRoute } from "astro";

export const GET: APIRoute = ({ redirect }) =>
  redirect("https://shikanime.studio", 301);
