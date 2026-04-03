# Card Shop Demo

Demo app ban card game voi flow hoan chinh:

- Lay san pham tu TCG API
- Tim kiem card
- Phan trang san pham
- Sort theo gia
- Page size selector (10/20/30)
- URL state chia se duoc (`q`, `sort`, `page`, `pageSize`)
- Recent searches + reset filters nhanh
- Quan ly gio hang (add/update/remove)
- Toast feedback khi add/remove cart
- Checkout voi React Hook Form + Zod
- Sticky order review, trang thai submit ro rang
- Tao order qua API route
- Luu `Orders` + `OrderItems` vao Google Sheets

## Tech stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- React Query
- React Hook Form
- Zod
- Google Sheets API (`googleapis`)

React Query duoc cau hinh cache theo `query + page + pageSize + sort`, giu du lieu trang truoc khi doi trang/search de trai nghiem muot hon.

## Setup

1. Cai dependencies:

```bash
npm install
```

2. Tao file `.env.local` tu `.env.example`:

```bash
cp .env.example .env.local
```

3. Dien cac bien moi truong:

- `TCG_API_BASE_URL` (default: `https://api.pokemontcg.io/v2/cards`)
- `TCG_API_KEY` (optional)
- `ORDER_STORAGE_PROVIDER` (`googleapis` hoac `apps_script`)
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `APPS_SCRIPT_WEB_APP_URL`
- `APPS_SCRIPT_TOKEN`
- `BYPASS_GOOGLE_SHEETS_IN_DEV` (optional, default `false`)

4. Chay app:

```bash
npm run dev
```

App mac dinh chay tai [http://localhost:3002](http://localhost:3002).

## Local mock fallback

- O local dev (`NODE_ENV !== production`), neu thieu Google credentials thi app van cho dat hang thanh cong de demo flow.
- Luc nay order **khong** duoc ghi vao Google Sheets (chi mock fallback).
- Ban co the bat ro rang fallback bang `BYPASS_GOOGLE_SHEETS_IN_DEV=true`.
- O production, thieu credentials se fail API de tranh mat du lieu that.

## Google Sheets format

Can tao 2 tab trong spreadsheet:

- `Orders` voi cot: `orderCode`, `createdAt`, `customerName`, `phone`, `address`, `note`, `subtotal`, `total`, `status`
- `OrderItems` voi cot: `orderCode`, `productId`, `productName`, `price`, `quantity`, `lineTotal`

## Google Sheets Apps Script bootstrap

Ban co the auto tao/sua sheet schema bang script co san:

1) Mo spreadsheet can dung  
2) Extensions -> Apps Script  
3) Copy file `docs/google-sheets-setup.gs` vao editor Apps Script  
4) Run ham `setupCardShopSheets()`  

Script se:

- Tao tab `Orders` neu chua co
- Tao tab `OrderItems` neu chua co
- Dam bao header dung format
- Freeze dong header + style co ban

Ban mau day du theo mo hinh 5 file Apps Script da co san trong:

- `docs/apps-script/Config.gs`
- `docs/apps-script/Setup.gs`
- `docs/apps-script/Utils.gs`
- `docs/apps-script/OrderService.gs`
- `docs/apps-script/Api.gs`

Neu ban tach theo 5 file, noi dung `docs/google-sheets-setup.gs` se dat vao `Setup.gs`.

### Co can Service Account neu da dung Apps Script?

- Neu app Next.js cua ban van ghi Sheets bang `googleapis` (code hien tai), **van can** Service Account + cac env Google.
- Apps Script bootstrap o tren chi giai quyet phan tao/can chinh cau truc sheet.
- Neu dung Apps Script Web App, dat:
  - `ORDER_STORAGE_PROVIDER=apps_script`
  - `APPS_SCRIPT_WEB_APP_URL=<url web app da deploy>`
  - `APPS_SCRIPT_TOKEN=<token ban dat trong script>`
- Luc nay khong bat buoc Service Account de ghi order nua.

## Deploy len Cloudflare Workers (OpenNext)

Project da duoc setup san OpenNext Cloudflare adapter.

### 1) Kiem tra local build cho Cloudflare

```bash
npx opennextjs-cloudflare build
```

### 2) Dang nhap Cloudflare

```bash
npx wrangler login
```

### 3) Dat secret tren Cloudflare Worker

Can set tat ca bien moi truong dang dung o `.env.local`.
Vi du:

```bash
npx wrangler secret put TCG_API_BASE_URL
npx wrangler secret put TCG_API_KEY
npx wrangler secret put ORDER_STORAGE_PROVIDER
npx wrangler secret put APPS_SCRIPT_WEB_APP_URL
npx wrangler secret put APPS_SCRIPT_TOKEN
npx wrangler secret put BYPASS_GOOGLE_SHEETS_IN_DEV
```

Neu ban dung provider `googleapis` thi set them:

```bash
npx wrangler secret put GOOGLE_CLIENT_EMAIL
npx wrangler secret put GOOGLE_PRIVATE_KEY
npx wrangler secret put GOOGLE_SHEET_ID
```

### 4) Deploy

```bash
npm run deploy
```

### 5) Preview local bang runtime Cloudflare

```bash
npm run preview
```
