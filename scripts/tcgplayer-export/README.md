# TCGplayer Catalog Export Tool

Tool export du lieu card **One Piece** va **Riftbound** tu [TCGplayer API](https://docs.tcgplayer.com/docs/getting-started) ra CSV de shop dung lam database local (khong can crawl lai nhieu lan).

## Vi sao dung API thay vi scrape web?

- On dinh hon, co phan trang ro rang
- It nguy co bi chan IP hon scrape HTML
- Co `productId`, `displayName`, `marketPrice`, `extendedData` (Number/Rarity/Type)
- TCGplayer khuyen cao cache pricing local ([pricing docs](https://docs.tcgplayer.com/reference/pricing_getproductprices-1))

> Luu y: TCGplayer hien co the **khong cap API key moi**. Neu ban chua co key, can xin key cu hoac dung nguon du lieu thay the.

## Chuan bi

1. Copy config:

```bash
cp scripts/tcgplayer-export/config.example.env scripts/tcgplayer-export/.env
```

2. Dien vao `.env` (hoac `.env.local` o root project):

- `TCGPLAYER_PUBLIC_KEY`
- `TCGPLAYER_PRIVATE_KEY`

3. Cai runner (1 lan):

```bash
npm install
```

## Lenh su dung

### 1) Tim category ID (One Piece / Riftbound)

```bash
npm run tcg:discover
```

Neu can override thu cong, set:

- `TCGPLAYER_CATEGORY_ID_ONE_PIECE`
- `TCGPLAYER_CATEGORY_ID_RIFTBOUND`

### 2) Export CSV

```bash
# Export ca 2 game
npm run tcg:export

# Chi 1 game
npm run tcg:export -- --game one-piece
npm run tcg:export -- --game riftbound

# Resume neu bi ngat giua chung (khong crawl lai set da xong)
npm run tcg:export -- --resume

# Bo qua pricing de nhanh hon (priceUsd = 0)
npm run tcg:export -- --skip-pricing

# Custom output + delay
npm run tcg:export -- --output data/catalog-2026.csv --delay-ms 500
```

## Output

- CSV: `data/tcgplayer-catalog.csv` (mac dinh)
- Checkpoint: `.tcgplayer-export/checkpoint.json`
- Token cache: `.tcgplayer-export/token.json`

### Cot CSV

| Cot | Mo ta |
|---|---|
| `game` | `one-piece` hoac `riftbound` |
| `id` | ID noi bo cho app |
| `cardCode` | Ma card (uu tien Number, vd `OP13-118`) |
| `name` | Ten ngan |
| `displayName` | Ten day du (bat buoc ghi Sheet) |
| `image` | URL anh |
| `rarity`, `cardType`, `set`, `subtypes` | Metadata filter |
| `priceUsd` | Gia market USD (Normal uu tien) |
| `tcgPlayerUrl` | Link product TCGplayer |
| `stock` | Mac dinh `0` (merge tu tab `Kho` sau) |
| `tcgplayerProductId` | ID goc de cap nhat sau |

## Co che tranh crawl lap/spam

- Chi goi API 1 lan cho moi set (group), luu checkpoint theo `groupId`
- Token duoc cache den khi het han
- Co `delay-ms` giua moi request
- Co `--resume` de tiep tuc, khong export trung product da co

## Thong tin can ban cung cap (neu export loi/khong du)

1. **API credentials** (`PUBLIC_KEY`, `PRIVATE_KEY`) - bat buoc
2. **Category ID** (neu discover khong ra dung game)
3. Co can **chi lay Single Cards** hay ca Sealed? (hien tai: chi `Cards`)
4. Co can loc theo set cu the khong? (vd chi `OP13`, `RB01`)
5. Nguong rate limit mong muon (`delay-ms`, mac dinh 300)

## Buoc tiep theo trong shop

Sau khi co CSV:

1. Review vai dong `displayName` + `cardCode`
2. Merge `stock` tu Google Sheet tab `Kho`
3. Import CSV vao `src/lib/catalog-data.ts` hoac loader JSON (co the lam script import tiep)
