import { ProductGame } from "@/types/product";

type CatalogCard = {
  id: string;
  cardCode: string;
  name: string;
  displayName: string;
  image: string;
  rarity?: string;
  cardType: string;
  set: string;
  subtypes: string[];
  priceUsd: number;
  tcgPlayerUrl: string;
  stock: number;
};

export const CATALOG_DATA: Record<ProductGame, CatalogCard[]> = {
  "one-piece": [
    {
      id: "op13-118-red-super-aa",
      cardCode: "OP13-118",
      name: "Monkey.D.Luffy",
      displayName:
        "Monkey.D.Luffy (118) (Red Super Alternate Art) - Carrying On His Will (OP13)",
      image:
        "https://images.pokemontcg.io/sm3/22_hires.png",
      rarity: "Super Rare",
      cardType: "Character",
      set: "OP13",
      subtypes: ["Supernova", "Straw Hat Crew"],
      priceUsd: 58,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&q=Monkey.D.Luffy+OP13-118",
      stock: 6,
    },
    {
      id: "op12-045-zoro-alt",
      cardCode: "OP12-045",
      name: "Roronoa Zoro",
      displayName:
        "Roronoa Zoro (045) (Alternate Art) - Rise of the New Era (OP12)",
      image:
        "https://images.pokemontcg.io/swsh7/119_hires.png",
      rarity: "Rare",
      cardType: "Character",
      set: "OP12",
      subtypes: ["Straw Hat Crew"],
      priceUsd: 21.5,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&q=Roronoa+Zoro+OP12-045",
      stock: 14,
    },
    {
      id: "op11-008-nami",
      cardCode: "OP11-008",
      name: "Nami",
      displayName: "Nami (008) - Wings of the Captain (OP11)",
      image:
        "https://images.pokemontcg.io/swsh9/122_hires.png",
      rarity: "Uncommon",
      cardType: "Character",
      set: "OP11",
      subtypes: ["Straw Hat Crew"],
      priceUsd: 7.4,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&q=Nami+OP11-008",
      stock: 20,
    },
    {
      id: "op10-001-gear5-event",
      cardCode: "OP10-001",
      name: "Gear Fifth",
      displayName: "Gear Fifth (001) - The New Emperor (OP10)",
      image:
        "https://images.pokemontcg.io/sm6/31_hires.png",
      rarity: "Secret Rare",
      cardType: "Event",
      set: "OP10",
      subtypes: ["Straw Hat Crew"],
      priceUsd: 83,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&q=Gear+Fifth+OP10-001",
      stock: 2,
    },
    {
      id: "op09-062-kid-leader",
      cardCode: "OP09-062",
      name: "Eustass Kid",
      displayName: "Eustass Kid (062) - Emperors in the New World (OP09)",
      image:
        "https://images.pokemontcg.io/swsh8/109_hires.png",
      rarity: "Leader",
      cardType: "Leader",
      set: "OP09",
      subtypes: ["Kid Pirates"],
      priceUsd: 12.8,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&q=Eustass+Kid+OP09-062",
      stock: 0,
    },
    {
      id: "op08-039-sanji",
      cardCode: "OP08-039",
      name: "Sanji",
      displayName: "Sanji (039) - Kingdoms of Intrigue (OP08)",
      image: "https://images.pokemontcg.io/swsh5/120_hires.png",
      rarity: "Rare",
      cardType: "Character",
      set: "OP08",
      subtypes: ["Straw Hat Crew"],
      priceUsd: 11.2,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&q=Sanji+OP08-039",
      stock: 10,
    },
    {
      id: "op08-077-trafalgar-law",
      cardCode: "OP08-077",
      name: "Trafalgar Law",
      displayName: "Trafalgar Law (077) (Parallel) - Kingdoms of Intrigue (OP08)",
      image: "https://images.pokemontcg.io/swsh10/78_hires.png",
      rarity: "Super Rare",
      cardType: "Character",
      set: "OP08",
      subtypes: ["Heart Pirates"],
      priceUsd: 29.9,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&q=Trafalgar+Law+OP08-077",
      stock: 5,
    },
    {
      id: "op07-021-shanks-leader",
      cardCode: "OP07-021",
      name: "Shanks",
      displayName: "Shanks (021) - 500 Years in the Future (OP07)",
      image: "https://images.pokemontcg.io/swsh11/144_hires.png",
      rarity: "Leader",
      cardType: "Leader",
      set: "OP07",
      subtypes: ["Red-Haired Pirates"],
      priceUsd: 19.4,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&q=Shanks+OP07-021",
      stock: 12,
    },
  ],
  riftbound: [
    {
      id: "rb01-007-arcane-spark",
      cardCode: "RB01-007",
      name: "Arcane Spark",
      displayName: "Arcane Spark (007) - Riftbound Origins (RB01)",
      image:
        "https://images.pokemontcg.io/swsh12/38_hires.png",
      rarity: "Rare",
      cardType: "Spell",
      set: "RB01",
      subtypes: ["Arcane"],
      priceUsd: 9.1,
      tcgPlayerUrl: "https://www.tcgplayer.com/search/all/product?q=Arcane+Spark+RB01-007",
      stock: 18,
    },
    {
      id: "rb01-042-iron-vanguard",
      cardCode: "RB01-042",
      name: "Iron Vanguard",
      displayName: "Iron Vanguard (042) - Riftbound Origins (RB01)",
      image:
        "https://images.pokemontcg.io/swsh6/135_hires.png",
      rarity: "Super Rare",
      cardType: "Unit",
      set: "RB01",
      subtypes: ["Mech"],
      priceUsd: 27,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/all/product?q=Iron+Vanguard+RB01-042",
      stock: 8,
    },
    {
      id: "rb02-003-shadow-rune",
      cardCode: "RB02-003",
      name: "Shadow Rune",
      displayName: "Shadow Rune (003) - Echoes of the Void (RB02)",
      image:
        "https://images.pokemontcg.io/swsh7/95_hires.png",
      rarity: "Uncommon",
      cardType: "Spell",
      set: "RB02",
      subtypes: ["Shadow"],
      priceUsd: 4.6,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/all/product?q=Shadow+Rune+RB02-003",
      stock: 35,
    },
    {
      id: "rb02-088-stormbreaker",
      cardCode: "RB02-088",
      name: "Stormbreaker Colossus",
      displayName: "Stormbreaker Colossus (088) - Echoes of the Void (RB02)",
      image:
        "https://images.pokemontcg.io/swsh10/123_hires.png",
      rarity: "Legendary",
      cardType: "Unit",
      set: "RB02",
      subtypes: ["Titan"],
      priceUsd: 63.3,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/all/product?q=Stormbreaker+Colossus+RB02-088",
      stock: 3,
    },
    {
      id: "rb03-014-rift-gate",
      cardCode: "RB03-014",
      name: "Rift Gate",
      displayName: "Rift Gate (014) - Age of Ruins (RB03)",
      image:
        "https://images.pokemontcg.io/swsh9/55_hires.png",
      rarity: "Rare",
      cardType: "Relic",
      set: "RB03",
      subtypes: ["Portal"],
      priceUsd: 16.9,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/all/product?q=Rift+Gate+RB03-014",
      stock: 0,
    },
    {
      id: "rb03-027-void-lancer",
      cardCode: "RB03-027",
      name: "Void Lancer",
      displayName: "Void Lancer (027) - Age of Ruins (RB03)",
      image: "https://images.pokemontcg.io/swsh10/75_hires.png",
      rarity: "Rare",
      cardType: "Unit",
      set: "RB03",
      subtypes: ["Void"],
      priceUsd: 13.7,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/all/product?q=Void+Lancer+RB03-027",
      stock: 22,
    },
    {
      id: "rb04-005-aether-compass",
      cardCode: "RB04-005",
      name: "Aether Compass",
      displayName: "Aether Compass (005) - Celestial Convergence (RB04)",
      image: "https://images.pokemontcg.io/swsh12/117_hires.png",
      rarity: "Uncommon",
      cardType: "Relic",
      set: "RB04",
      subtypes: ["Artifact"],
      priceUsd: 6.2,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/all/product?q=Aether+Compass+RB04-005",
      stock: 31,
    },
    {
      id: "rb04-091-astral-drake",
      cardCode: "RB04-091",
      name: "Astral Drake",
      displayName: "Astral Drake (091) (Foil) - Celestial Convergence (RB04)",
      image: "https://images.pokemontcg.io/swsh12/95_hires.png",
      rarity: "Legendary",
      cardType: "Unit",
      set: "RB04",
      subtypes: ["Dragon"],
      priceUsd: 71.5,
      tcgPlayerUrl:
        "https://www.tcgplayer.com/search/all/product?q=Astral+Drake+RB04-091",
      stock: 4,
    },
  ],
};
