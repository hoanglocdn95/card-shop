import type { vi } from "@/i18n/messages/vi";

export type Locale = "en" | "vi";

export type Messages = {
  [K in keyof typeof vi]: {
    [P in keyof (typeof vi)[K]]: (typeof vi)[K][P] extends string
      ? string
      : never;
  };
};

export type MessageKey = {
  [Section in keyof Messages]: {
    [Key in keyof Messages[Section]]: `${Section & string}.${Key & string}`;
  }[keyof Messages[Section]];
}[keyof Messages];
