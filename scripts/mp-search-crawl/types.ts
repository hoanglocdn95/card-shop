import type { ExportGame } from "../tcgplayer-export/types";

export type MpSearchProduct = {
  productId: number;
  productName: string;
  productUrlName: string;
  productLineId: number;
  productLineName: string;
  setId: number;
  setName: string;
  setCode: string;
  setUrlName: string;
  rarityName: string;
  marketPrice?: number | null;
  lowestPrice?: number | null;
  sealed?: boolean;
  customAttributes?: {
    number?: string | null;
    cardType?: string[];
    subtypes?: string[];
    color?: string[];
    description?: string | null;
    releaseDate?: string | null;
  };
};

export type MpSearchResponse = {
  totalResults: number;
  results: MpSearchProduct[];
  resultId?: string;
};

export type MpGameCheckpoint = {
  productLineName: string;
  from: number;
  totalResults: number;
  exportedProductIds: number[];
  done: boolean;
};

export type MpExportCheckpoint = {
  version: 1;
  updatedAt: string;
  games: Partial<Record<ExportGame, MpGameCheckpoint>>;
};
