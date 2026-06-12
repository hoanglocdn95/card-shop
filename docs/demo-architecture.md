# Card Shop Demo — Database & Server Architecture

Phase demo: **không dùng database/backend truyền thống**.

```txt
Google Sheet (+ CSV trên Drive) = Database tạm
Google Apps Script            = Backend API
Next.js                       = Frontend (+ API proxy mỏng, giữ token bí mật)
```

## Vai trò từng phần

### Google Sheet (tabs)

| Tab | Mục đích |
|-----|----------|
| **Products** | Card đã crawl/import (game, id, cardCode, giá USD, ảnh, …) |
| **Inventory** | Tồn kho theo `key` (= cardCode hoặc product id) |
| **Vouchers** | Mã giảm giá (`code`, `type`, `scope`, `value`, `active`) |
| **ShippingRules** | Phí ship theo `minSubtotal` |
| **Orders** | Đơn hàng (subtotal, ship, discount, total do server tính) |
| **OrderItems** | Chi tiết dòng đơn |
| **Settings** | `priceMultiplier`, `defaultShippingFee`, `usdVndRate` (tuỳ chọn) |

Tab **Kho** cũ vẫn đọc được (alias Inventory).

### Google Apps Script (`docs/apps-script/`)

Deploy Web App → URL `/exec`. Mọi request cần `token` (Script Property `API_TOKEN`).

| Action | Method | Mô tả |
|--------|--------|--------|
| `setup` | GET/POST | Tạo/sửa cấu trúc sheet |
| `listProducts` | GET | Danh sách SP (game, q, page, pageSize) |
| `listInventory` | GET | Tồn kho (alias `listStock`) |
| `getSettings` | GET | Cấu hình shop |
| `validateVoucher` | GET | Kiểm tra mã |
| `previewCheckout` | POST | Tính subtotal/ship/total (không ghi đơn) |
| `createOrder` | POST | Validate + tính tiền + ghi Orders/OrderItems |
| `listOrders` / `getOrder` | GET | Admin/tra cứu |
| `clearCache` | POST | Xóa cache Products/Settings |

**createOrder** nhận `productId`, `cardCode`, `game`, `quantity` — **không tin** giá/tổng từ client.

### Next.js

| Route | Vai trò |
|-------|---------|
| `GET /api/products` | Proxy → `listProducts` (fallback CSV local nếu Sheet trống) |
| `POST /api/orders` | Proxy → `createOrder` |
| `POST /api/checkout/preview` | Proxy → `previewCheckout` |
| `GET /api/settings` | Proxy → `getSettings` |

Frontend: hiển thị, cart, checkout; gọi API nội bộ; **không** gọi Sheet/Drive trực tiếp.

## Setup nhanh

1. Tạo Google Spreadsheet → copy toàn bộ file `.gs` trong `docs/apps-script/` vào Apps Script project.
2. Script Properties: `API_TOKEN` = chuỗi bí mật dài.
3. Chạy **Card Shop → Setup / Repair Sheets**.
4. Import catalog:
   - Upload `data/tcgplayer-catalog.csv` lên Drive (Restricted).
   - Script Property `CATALOG_IMPORT_FILE_ID` = file id.
   - **Card Shop → Import Products from Drive CSV**.
   - Hoặc dán dữ liệu vào tab Products thủ công.
5. Điền **Inventory** (key = `OP12-047`, stock = số lượng).
6. Deploy Web App (Execute as me, Anyone with link — vẫn cần token).
7. `.env` / Wrangler secrets:
   - `APPS_SCRIPT_WEB_APP_URL`
   - `APPS_SCRIPT_TOKEN`
   - `ORDER_STORAGE_PROVIDER=apps_script` (mặc định)

Dev không có Apps Script: `BYPASS_GOOGLE_SHEETS_IN_DEV=true` → order mock; products vẫn đọc CSV trong `data/`.

## Order flow

```txt
User → cart → checkout
  → POST /api/orders { facebookName, items[{ productId, cardCode, game, qty }], discountCode? }
    → Apps Script createOrder
      → đọc Products + Inventory + Vouchers + ShippingRules
      → tính giá VND, ship, discount
      → ghi Orders + OrderItems
      → trả orderCode + total
  → success page
```

## Sau này thay Sheet bằng DB thật

Giữ contract JSON của Apps Script (hoặc thay `apps-script/client.ts` bằng REST service) — `fetch-products.ts`, checkout, order types không đổi nhiều.
