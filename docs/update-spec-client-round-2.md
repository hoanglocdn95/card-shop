# Card Shop - Update Spec (Client Round 2)

## 1) Mục tiêu cập nhật

Nâng cấp app từ demo báo giá sang flow gần thực tế hơn:

- Hỗ trợ 2 game: `One Piece`, `Riftbound`
- Bắt buộc thu thập `Facebook name` trước khi vào trang báo giá
- Bộ lọc/sort/search chi tiết hơn theo dữ liệu card thực
- Đổi logic pricing theo VND + tỷ giá + discount
- Cập nhật flow checkout xác nhận cuối + ghi chú
- Chuẩn hóa output ghi Google Sheet theo cấu trúc mới

---

## 2) Yêu cầu đã hiểu (functional)

## 2.1 Onboarding bắt buộc

- Khi user mở trang lần đầu:
  - hiển thị popup bắt buộc nhập `Facebook name`
  - chỉ sau khi bấm `Next` mới vào trang báo giá
- Giá trị Facebook cần dùng lại khi submit order

## 2.2 Trang báo giá

- Search:
  - Tìm theo `card name` (ví dụ `Monkey.D.Luffy`)
  - Tìm theo `card code` (ví dụ `OP13-118`)
  - Trong vòng này (giữ data hiện tại): `card code` có thể tạm map sang field `sku` mà app đang nhận, để người dùng vẫn có thể tìm được theo dạng mã.
- Filter:
  - Stock Status (đồng bộ từ sheet "Kho")
  - Color
  - Card Type
  - Set
  - Rarity
  - Subtype(s) (nice-to-have nếu dữ liệu cho phép)
  - Bỏ filter Price hiện tại
- Sort: tương tự TCGPlayer
- Page size: chỉ `50` hoặc `100`, mặc định `50`
- Card / row: giữ như hiện tại
- Card sold out:
  - không cho add
  - giảm opacity
  - tắt badge `In stock/Sold out` trên card
- Click thumbnail card:
  - mở trang card trên TCGPlayer (tab mới)

## 2.3 Pricing

- Giá hiển thị VND theo công thức:
  - `VND = (USDVND_rate_google * 1.1 * cardUSD)`
  - làm tròn lên nghìn gần nhất
- Summary thêm:
  - phí ship dự kiến `35,000 VND`
  - ô nhập `discount code`
  - discount code làm thay đổi `tỷ giá` trong công thức

## 2.4 Checkout flow mới

- Khi bấm checkout -> popup confirm cuối:
  - hỏi user có chắc chắn gửi list không
  - có ô `Ghi chú`
  - user bấm `Xác nhận` mới gửi về Sheet

## 2.5 Google Sheet output mới

- Sheet `Order`:
  - `orderCode`
  - `createdAt`
  - `Facebook`
  - `Ghi chú`
  - Không cần `status`
  - Client đang thắc mắc `subtotal` vs `total` (có thể bỏ 1 cột nếu không có logic riêng)
- Sheet `OrderItems`:
  - `orderCode`
  - `productName` (bắt buộc full name đúng như trang TCGPlayer)
  - `price` (snapshot lúc confirm)
  - `quantity`
  - `rarity` (nice-to-have)
  - `lineTotal` có thể bỏ

---

## 3) Thiết kế kỹ thuật đề xuất

## 3.1 Data source & mapping card

- Đề xuất tạo adapter dữ liệu theo game:
  - `one-piece` -> source API One Piece đang dùng
  - `riftbound` -> source API tương ứng (nếu có endpoint/public dataset)
- Chuẩn hóa model nội bộ:
  - `displayName` (full name để ghi Sheet)
  - `cardCode`
  - `game`
  - `set`
  - `rarity`
  - `cardType`
  - `subtypes[]`
  - `stock`
  - `tcgPlayerUrl`
  - `priceUsd`

## 3.2 Stock sync với Google Sheet "Kho"

- Tạo read service lấy stock từ tab `Kho` theo key card (`cardCode` hoặc `productId`)
- Hướng đồng bộ:
  - mỗi lần gọi API products -> merge stock từ `Kho`
  - nếu không có record trong `Kho`, fallback theo stock API gốc
- Ưu tiên dùng cache ngắn (30-60s) để giảm quota đọc Sheet

## 3.3 Pricing engine

- Thêm module `pricing.ts`:
  - lấy tỷ giá USD/VND
  - áp multiplier `1.1`
  - áp modifier từ `discount code`
  - round up to nearest 1000
  - cộng phí ship 35k
- Snapshot giá tại thời điểm confirm để ghi order

## 3.4 Checkout confirm modal

- Bổ sung modal trước submit thật:
  - summary
  - note input
  - confirm/cancel
- Chỉ call `/api/orders` khi user confirm trong modal

## 3.5 Schema Order/OrderItems mới

- Update Zod schema và writer:
  - Order: chỉ cột được duyệt
  - OrderItems: chỉ cột được duyệt
- Apps Script setup script cần cập nhật header theo schema mới

---

## 4) Quyết định đã chốt theo phản hồi mới

## 4.1 Nguồn dữ liệu game

- Trước mắt giữ nguyên data source hiện tại của app.
- Không block việc triển khai vòng này vì chưa cần đổi API cho `Riftbound` và `One Piece`.

## 4.2 Giá USD gốc

- Không ép cứng duy nhất `price-points__upper__price`.
- Đề xuất chuẩn an toàn:
  1) ưu tiên `price-points__upper__price` (nếu có)
  2) fallback sang field giá hiện tại của app
  3) nếu vẫn thiếu thì cho giá = 0 và disabled add-to-cart
- Mục tiêu kinh doanh là giá cuối theo VND, nên giá USD là input trung gian có fallback rõ ràng.

## 4.3 Tỷ giá USD/VND

- Không có Google public API chính thức cho tỷ giá theo cách "Google Search converter".
- Giải pháp đề xuất:
  - dùng API tỷ giá đáng tin cậy (ví dụ exchangerate.host hoặc frankfurter)
  - cache ngắn 15-30 phút
  - fallback theo giá trị cấu hình trong Google Sheet (tab `Config`) hoặc env
- Công thức giá bán vẫn giữ:
  - `finalVnd = roundUpToNearest1000(usdVndRate * 1.1 * cardUsd)`

## 4.4 Discount code

- Rule đã chốt:
  - giảm theo phần trăm: ví dụ `-10%` thì tổng còn `90%`
  - giảm theo số tiền cố định: trừ thẳng vào tổng bill
- Cách áp dụng đề xuất:
  - tính tổng hàng + ship -> áp discount -> clamp không âm
- Nơi lưu discount code:
  - ưu tiên tab `DiscountCodes` trong Google Sheet để dễ vận hành
  - fallback env/hardcode khi chưa có tab

## 4.5 Stock tab "Kho"

- Cấu trúc đề xuất để chốt:
  - `game` (One Piece / Riftbound)
  - `cardCode` (key chính)
  - `productName` (để đối soát)
  - `stock`
  - `updatedAt` (optional)
  - `note` (optional)
- Quy tắc:
  - map stock theo `(game + cardCode)`
  - `stock <= 0` hoặc trống => sold out
  - sold out: giảm opacity + disable add-to-cart

## 4.6 Sort giống TCGPlayer

- Bộ sort đề xuất vòng này:
  - Relevance
  - Price: Low to High
  - Price: High to Low
  - Name: A to Z
  - Name: Z to A

## 4.7 Google Sheet output cuối cùng

- Đã chốt theo yêu cầu client:
  - Bỏ `subtotal`
  - Bỏ `status`
- `Order` (đầu ra tối thiểu):
  - `orderCode`
  - `createdAt`
  - `facebook`
  - `note`
- `OrderItems`:
  - `orderCode`
  - `productName` (full name đúng như trang TCGPlayer)
  - `price` (snapshot lúc confirm)
  - `quantity`
  - `rarity` (nếu có thì ghi, không có để trống)
  - không cần `lineTotal`

---

## 5) Kế hoạch triển khai đề xuất

## Phase A - Data & pricing foundation

- Chuẩn hóa model card mới
- Game switcher (One Piece / Riftbound)
- Search theo `name + code`
- Pricing engine VND + shipping + discount

## Phase B - Filters & UX

- Filter: stock/color/type/set/rarity/subtypes
- Sort options theo danh sách chốt
- Page size 50/100
- Sold-out visual + disable add
- Link thumbnail -> TCGPlayer

## Phase C - Checkout & Sheets

- Popup bắt buộc Facebook trước khi vào trang
- Confirm modal + note trước submit
- Update API order + schema
- Update Apps Script headers + writer theo cột mới
- Đồng bộ stock từ tab `Kho`

## Phase D - QA

- Test E2E theo 2 game
- Test snapshot giá, discount, shipping
- Test sold-out sync khi sửa sheet `Kho`

---

## 6) Điểm còn cần xác nhận ngắn trước khi code

1. Có giữ thêm cột `total` ở sheet `Order` để kế toán dễ đối soát không?
   - Khuyến nghị: nên giữ `total` dù bỏ `subtotal`.
2. Tab tỷ giá/discount trong Sheet có dùng tên mặc định:
   - `Config` (tỷ giá fallback)
   - `DiscountCodes` (mã giảm giá)
3. Sort list có đúng bộ 5 lựa chọn đã đề xuất không?

---

## 7) Trạng thái hiện tại

- File này là bản phân tích/spec để chốt scope.
- Chưa implement yêu cầu mới ở code theo round này.
- Sau khi chốt 3 điểm ở mục 6, sẽ chuyển sang implementation theo Phase A -> D.
