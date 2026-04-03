# 🚀 CARD-SHOP DEMO - IMPLEMENTATION CHECKLIST

## 📌 Project Overview

- Tên project: `card-shop`
- Mục tiêu:
  - Lấy dữ liệu card từ TCG API
  - Cho phép user chọn sản phẩm, tạo đơn hàng
  - Lưu đơn hàng vào Google Sheets
- Tech stack:
  - Next.js + TypeScript
  - TailwindCSS
  - React Query
  - Google Sheets API

---

# 🧱 PHASE 1 — SETUP PROJECT

## 1.1 Init project

- Tạo project Next.js (App Router, TypeScript)
- Setup TailwindCSS
- Setup folder structure:
src/
app/
page.tsx // Trang danh sách sản phẩm + search + add to cart
checkout/
page.tsx // Trang checkout + form thông tin khách hàng + review order
success/
page.tsx // Trang hiển thị kết quả đặt hàng thành công
api/
products/
route.ts // API nội bộ lấy dữ liệu từ TCG API và chuẩn hoá dữ liệu
orders/
route.ts // API nội bộ tạo đơn hàng và lưu vào Google Sheets
components/
product/
product-list.tsx // Danh sách sản phẩm
product-card.tsx // Card hiển thị 1 sản phẩm
product-search.tsx // Ô tìm kiếm sản phẩm
cart/
cart-panel.tsx // Khu vực hiển thị giỏ hàng
cart-item.tsx // Item trong giỏ hàng
cart-summary.tsx // Tóm tắt subtotal/total
checkout/
checkout-form.tsx // Form nhập thông tin khách hàng
order-review.tsx // Khu vực review đơn hàng trước khi submit
common/
loading.tsx // Loading UI
error-state.tsx // Error UI
empty-state.tsx // Empty UI
button.tsx // Wrapper button nếu cần
input.tsx // Wrapper input nếu cần
  lib/
  tcg-api.ts // Hàm gọi TCG API
  google-sheets.ts // Hàm xác thực và ghi dữ liệu vào Google Sheets
  order.ts // Logic tính toán đơn hàng, subtotal, total, generate orderCode
  utils.ts // Utility helper chung
  env.ts // Helper parse env nếu cần
  hooks/
  use-products.ts // Hook lấy danh sách sản phẩm
  use-cart.ts // Hook quản lý giỏ hàng
  use-checkout.ts // Hook submit order nếu cần tách riêng
  types/
  product.ts // Type Product
  cart.ts // Type CartItem
  order.ts // Type OrderPayload, OrderResponse, OrderStatus
  schemas/
  order.schema.ts // Zod schema validate đơn hàng
  product.schema.ts // Zod schema validate dữ liệu product từ API nếu cần
  constants/
  order.ts // Hằng số status đơn hàng, default values
  app.ts // Hằng số chung của app

## 1.2 Install dependencies

- @tanstack/react-query
- react-hook-form
- zod
- @hookform/resolvers
- axios
- googleapis
- dayjs
- nanoid

## 1.3 Setup env

- TCG_API_BASE_URL
- TCG_API_KEY (nếu có)
- GOOGLE_CLIENT_EMAIL
- GOOGLE_PRIVATE_KEY
- GOOGLE_SHEET_ID

---

# 🔌 PHASE 2 — TCG API INTEGRATION

## 2.1 Create TCG API module

File: `src/lib/tcg-api.ts`

- Tạo function fetchProducts()
- Tạo function searchProducts(query)
- Map dữ liệu API về format nội bộ

## 2.2 Define Product type

File: `src/types/product.ts`

- id
- sku
- name
- image
- price
- stock (optional)

## 2.3 Create API route

File: `/api/products/route.ts`

- Call TCG API
- Map data
- Return JSON standardized

---

# 🖥️ PHASE 3 — PRODUCT UI

## 3.1 Product list page

- Hiển thị danh sách sản phẩm
- Hiển thị:
  - name
  - image
  - price
- Nút "Add to cart"

## 3.2 Search feature

- Input search
- Call API search
- Debounce request

## 3.3 Loading & Error state

- Loading skeleton
- Error fallback UI

---

# 🛒 PHASE 4 — CART SYSTEM

## 4.1 Create cart state

- Tạo hook `useCart`
- Store:
  - items[]
  - addItem
  - removeItem
  - updateQuantity
  - clearCart

## 4.2 Cart item structure

- productId
- name
- price
- quantity
- lineTotal

## 4.3 Cart UI

- Hiển thị danh sách item
- Update quantity
- Remove item
- Show subtotal

---

# 🧾 PHASE 5 — CHECKOUT

## 5.1 Create checkout form

- customerName
- phone
- address
- note

## 5.2 Form validation (zod)

- Required fields
- Phone not empty
- Cart must not be empty

## 5.3 Order preview

- Hiển thị:
  - danh sách item
  - subtotal
  - total

---

# 📡 PHASE 6 — ORDER API

## 6.1 Create schema

File: `src/schemas/order.schema.ts`

- Validate:
  - customer info
  - items[]
  - quantity > 0

## 6.2 Create order logic

File: `src/lib/order.ts`

- Calculate subtotal
- Calculate total
- Generate orderCode
- Snapshot price

## 6.3 Create API route

File: `/api/orders/route.ts`

- Validate payload
- Recalculate total (server-side)
- Generate orderCode
- Call Google Sheets service
- Return response

---

# 📊 PHASE 7 — GOOGLE SHEETS

## 7.1 Setup Google Sheets

- Create Sheet with 2 tabs:
  - Orders
  - OrderItems

## 7.2 Orders columns

- orderCode
- createdAt
- customerName
- phone
- address
- note
- subtotal
- total
- status

## 7.3 OrderItems columns

- orderCode
- productId
- productName
- price
- quantity
- lineTotal

## 7.4 Create Google Sheets module

File: `src/lib/google-sheets.ts`

- Authenticate with service account
- Append Orders row
- Append OrderItems rows

---

# 🎯 PHASE 8 — CONNECT FLOW

## 8.1 Connect FE → API

- Submit order từ frontend
- Call `/api/orders`

## 8.2 Handle response

- Success → redirect to success page
- Error → show error message

## 8.3 Prevent duplicate submit

- Disable button khi submit
- Loading state

---

# 🎉 PHASE 9 — SUCCESS PAGE

## 9.1 Create success page

- Hiển thị:
  - orderCode
  - total
  - customerName
  - createdAt

## 9.2 Reset cart

- Clear cart after success

---

# 🧪 PHASE 10 — TESTING

## 10.1 Product

- Load product
- Search works
- Error handling

## 10.2 Cart

- Add item
- Update quantity
- Remove item

## 10.3 Checkout

- Validate form
- Prevent empty cart

## 10.4 Order API

- Valid payload
- Invalid payload
- Google Sheets write success

## 10.5 End-to-end

- Full flow:
  - add item
  - checkout
  - submit
  - check Google Sheet

---

# 🚀 BONUS (OPTIONAL)

## Email notification

- Send email when order created

## PDF quotation

- Generate quote file

## Stock display

- Show stock from API

---

# 🧠 RULES (IMPORTANT)

- Không tin total từ frontend → luôn tính lại ở backend
- Snapshot giá khi order
- Không để logic business nằm trong component UI
- Mọi API phải có error handling rõ ràng

---

# ✅ DONE CRITERIA

App được coi là hoàn thành khi:

- User chọn sản phẩm được
- Có thể thêm vào giỏ
- Có thể tạo đơn
- Google Sheet nhận dữ liệu đúng
- Có màn hình success
- Không crash trong flow chính

---

# 💥 DEMO SCRIPT

1. Mở app
2. Search card
3. Add vào cart
4. Nhập thông tin
5. Nhấn Order
6. Mở Google Sheet → thấy đơn mới

