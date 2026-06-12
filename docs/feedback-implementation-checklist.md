# Feedback Implementation Checklist

Checklist theo `Feedback.txt` de theo doi tien do implement.

## P1 - Bat buoc

- [x] Doi data source sang One Piece + Riftbound
  - [x] Them truong `game` vao model product (`one-piece` | `riftbound`)
  - [x] Tao adapter fetch rieng cho tung game
  - [x] Co game switcher tren UI
  - [x] Done khi doi game la doi dung danh sach card

- [x] Search dung theo ten + ma card thuc te
  - [x] Search server-side theo ca `name` va `cardCode` (vi du `OP13-118`)
  - [x] Khong phu thuoc `sku` gia lap tu Pokemon
  - [x] Done khi nhap `Monkey.D.Luffy` va `OP13-118` deu ra dung card

- [x] Filter du muc yeu cau
  - [x] Stock Status (dong bo tab `Kho`)
  - [x] Card Type
  - [x] Set
  - [x] Rarity
  - [x] Subtype(s)
  - [x] Done khi moi filter tac dong dung ket qua list

- [x] Pricing + shipping dung rule moi
  - [x] Giu cong thuc `usd/vnd * 1.1 * gia card`, lam tron nghin
  - [x] Doi shipping mac dinh thanh `36,000`
  - [x] Them cho de admin chinh shipping (Config Sheet hoac env)
  - [x] Done khi thay shipping tu cau hinh, app tu cap nhat total

- [x] Discount theo yeu cau van hanh
  - [x] Ho tro giam `% gia ban`, `% ship`, hoac fixed amount
  - [x] Co noi quan ly discount (uu tien Sheet `DiscountCodes`) (dang dung theo convention code)
  - [x] Done khi nhap ma hop le, tong tien doi dung theo rule

- [x] Checkout confirm popup
  - [x] Bam Checkout -> hien popup xac nhan cuoi
  - [x] Co o Ghi chu trong popup
  - [x] Chi gui order khi bam "Xac nhan"
  - [x] Done khi cancel thi khong gui, confirm moi ghi Sheet

- [x] Google Sheet output chuan
  - [x] `Order`: `orderCode`, `createdAt`, `facebook`, `note` (va `total` neu giu)
  - [x] `OrderItems`: `orderCode`, `productName` (full name chuan TCGPlayer), `price`, `quantity`, `rarity`
  - [x] Loai bo cot khong con dung neu da chot (`lineTotal`, `status`, `subtotal`)
  - [x] Done khi 1 order test ghi dung cau truc cot moi

## P2 - UX/UI

- [x] Viet hoa giao dien chinh
  - [x] Header, filter, cart, checkout, success, error/empty state
  - [x] Done khi khong con text tieng Anh o flow chinh

- [x] Header dung yeu cau
  - [x] Bo `Collections`, `All products`
  - [x] `Contact` hien thi: Ten shop, SDT, dia chi, Facebook, Youtube, Tiktok
  - [x] Done khi bam Contact thay day du thong tin

- [x] Toi uu kich thuoc thumbnail
  - [x] Giam size card ve muc "nhu lan truoc"
  - [x] Kiem tra desktop + mobile
  - [x] Done khi ty le card khong qua to, luoi can doi

- [x] Them background texture nhe
  - [x] Dang giay/kim loai nhe, khong anh huong do doc
  - [x] Done khi co texture tinh te, UI van ro rang

## P3 - On dinh va kiem thu

- [x] Test du lieu that OP/RB
  - [x] Search, filter, sort, stock sync, sold-out behavior

- [x] Test tinh tien
  - [x] Round nghin, shipping 36k, discount nhieu case

- [x] Test checkout end-to-end
  - [x] Popup confirm + note
  - [x] Ghi Sheet dung ten `productName` full TCGPlayer

- [x] Regression test
  - [x] Cart add/remove/update
  - [x] Pagination, page size, performance

## Thu tu thuc hien de chay nhanh

1. Data model + source OP/RB
2. Search/filter theo du lieu moi
3. Pricing/shipping/discount
4. Checkout popup + Sheets schema
5. Viet hoa + UI polish (header, thumbnail, texture)
6. QA end-to-end
