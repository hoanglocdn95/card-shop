import type { ExportGame } from "../tcgplayer-export/types";

export type MpGameConfig = {
  game: ExportGame;
  productLineName: string;
  productLineId: number;
  label: string;
};

export const MP_GAMES: Record<ExportGame, MpGameConfig> = {
  "one-piece": {
    game: "one-piece",
    productLineName: "one-piece-card-game",
    productLineId: 68,
    label: "One Piece Card Game",
  },
  riftbound: {
    game: "riftbound",
    productLineName: "riftbound-league-of-legends-trading-card-game",
    productLineId: 89,
    label: "Riftbound: League of Legends Trading Card Game",
  },
};
