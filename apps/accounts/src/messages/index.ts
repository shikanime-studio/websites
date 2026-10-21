import en from "../messages/en.json";

export type AppMessages = typeof en;

export const appMessages = {
  en,
} satisfies Record<string, AppMessages>;

export type AppLocale = keyof typeof appMessages;
