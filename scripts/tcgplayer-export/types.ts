export type ExportGame = "one-piece" | "riftbound";

export type CatalogCsvRow = {
  game: ExportGame;
  id: string;
  cardCode: string;
  name: string;
  displayName: string;
  image: string;
  rarity: string;
  cardType: string;
  set: string;
  subtypes: string;
  priceUsd: number;
  tcgPlayerUrl: string;
  stock: number;
  tcgplayerProductId: number;
  tcgplayerGroupId: number;
  tcgplayerCategoryId: number;
  modifiedOn: string;
};

export type TcgCategory = {
  categoryId: number;
  name: string;
  displayName?: string;
};

export type TcgGroup = {
  groupId: number;
  name: string;
  abbreviation?: string;
  categoryId: number;
};

export type TcgExtendedData = {
  name: string;
  displayName?: string;
  value: string;
};

export type TcgCatalogProduct = {
  productId: number;
  name: string;
  cleanName?: string;
  imageUrl?: string;
  categoryId: number;
  groupId: number;
  url?: string;
  modifiedOn?: string;
  extendedData?: TcgExtendedData[];
};

export type TcgProductPrice = {
  productId: number;
  marketPrice?: number | null;
  lowPrice?: number | null;
  subTypeName?: string;
};

export type GameCheckpoint = {
  categoryId: number;
  completedGroupIds: number[];
  exportedProductIds: number[];
};

export type ExportCheckpoint = {
  version: 1;
  updatedAt: string;
  games: Partial<Record<ExportGame, GameCheckpoint>>;
};
