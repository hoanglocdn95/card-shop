# TCGplayer Marketplace Search crawl (khong can API key)

Tool lay du lieu tu API ma trinh duyet TCGplayer goi khi mo trang tim kiem — cung nguon voi [trang One Piece tren TCGplayer](https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&view=grid).

Khong can `TCGPLAYER_PUBLIC_KEY` / `TCGPLAYER_PRIVATE_KEY`.

## Endpoint chinh

```
POST https://mp-search-api.tcgplayer.com/v1/search/request?q=&isList=false&mpfev=5199
```

Body JSON (tom tat):

- `algorithm`: `"sales_dismax"`
- `filters.term.productLineName`: `["one-piece-card-game"]` hoac Riftbound
- `listingSearch.filters.range.quantity.gte`: `1` (chi san pham con hang, giong mac dinh tren web)
- `context.shippingCountry`: `"VN"` (hoac US, ...)

## Lenh

```bash
# Thu 2 trang One Piece (~100 dong CSV)
npm run mp:export -- --game one-piece --max-pages 2 --output data/sample-op.csv

# Export day du One Piece + Riftbound (co checkpoint, resume)
npm run mp:export -- --game all

# Tiep tuc sau khi bi ngat
npm run mp:export -- --resume

# Lay ca out-of-stock (bo filter quantity >= 1)
npm run mp:export -- --all-stock
```

## Bắt request từ DevTools (tùy chọn)

```bash
npm run mp:capture
```

Ket qua luu tai `scripts/mp-search-crawl/.capture-output.json`.

## Cau hinh

Copy `scripts/mp-search-crawl/config.example.env` thanh `scripts/mp-search-crawl/.env` hoac them vao `.env.local`:

| Bien | Mac dinh | Mo ta |
|------|----------|--------|
| `TCG_MP_DELAY_MS` | 400 | Delay giua cac trang |
| `TCG_MP_PAGE_SIZE` | 50 | Kich thuoc trang |
| `TCG_MP_FEV` | 5199 | Query `mpfev` |
| `TCG_MP_SHIPPING_COUNTRY` | VN | Quoc gia cho gia |
| `TCG_MP_COOKIE` | (trong) | Cookie browser neu can |

## Output CSV

Cung cot voi `scripts/tcgplayer-export` / `data/tcgplayer-catalog.csv`:

- `game`, `id`, `cardCode`, `name`, `displayName`, `image`, `rarity`, `cardType`, `set`, `subtypes`, `priceUsd`, `tcgPlayerUrl`, `stock` (0 de ban cap nhat tab Kho tren Sheet)

Checkpoint: `.mp-search-crawl/checkpoint.json`

## Luu y

- Chi crawl du lieu **cong khai** tren marketplace; ton trong dieu khoan TCGplayer.
- Gia la **market price** USD tu ket qua tim kiem, khong phai gia tung listing seller.
- Anh: `https://product-images.tcgplayer.com/fit-in/437x437/{productId}.jpg`
