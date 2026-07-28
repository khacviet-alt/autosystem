# DATABASE DESIGN — Cashback Affiliate Platform

Phiên bản: 1.0
Ngày: 2026-07-28
Tác giả: Software Architecture Team

Giả định chính: tiền tệ mặc định là VNĐ. Payout ban đầu xử lý thủ công bởi admin. Ban đầu chỉ hỗ trợ Shopee; sau này có thể thêm marketplace khác qua adapter. Minimum withdrawal = 2.000 VND.

---

Tổng quan: danh sách bảng chính và vai trò của chúng trong hệ thống.

1. Danh sách bảng

- users
- auth_tokens
- links
- products
- link_snapshots
- orders
- transactions (ledger)
- withdrawals
- notifications
- admins (optional: admin metadata)
- integration_adapters (stores adapter metadata)
- jobs / jobs_log (background job tracking)

---

2. Mô tả từng bảng (fields chính, kiểu dữ liệu mô tả)

users
- id (PK, uuid): id người dùng
- email (string, indexed, unique, nullable=false)
- password_hash (string)
- full_name (string)
- phone (string, nullable)
- role (enum: user, admin)
- created_at (timestamp)
- updated_at (timestamp)
- is_active (boolean)
- kyc_status (enum: none/pending/verified/failed)

auth_tokens
- id (PK, uuid)
- user_id (FK -> users.id)
- type (enum: access, refresh)
- token_hash (string)
- expires_at (timestamp)
- created_at (timestamp)
- revoked (boolean)

links
- id (PK, uuid)
- user_id (FK -> users.id)
- source_url (text): link gốc user paste
- source (enum: shopee, lazada, tiki, other)
- affiliate_url (text, nullable): generated affiliate link
- title (string, nullable)
- thumbnail (string, nullable)
- price_vnd (bigint, nullable)
- currency (enum) — default: VND
- status (enum: pending, done, failed)
- metadata (jsonb): raw adapter response or parsing details
- created_at, updated_at

products
- id (PK, uuid)
- external_id (string): id from marketplace if available
- source (enum)
- title
- thumbnail_url
- current_price_vnd (bigint)
- currency
- shop_id (string)
- last_synced_at
- created_at, updated_at
- popularity_score (float, optional)

link_snapshots
- id (PK, uuid)
- link_id (FK -> links.id)
- product_id (FK -> products.id, nullable)
- snapshot (jsonb): full captured product payload at time of link creation
- created_at

orders
- id (PK, uuid)
- external_order_id (string, nullable)
- user_id (FK -> users.id, nullable) — when known
- link_id (FK -> links.id, nullable)
- product_id (FK -> products.id, nullable)
- source (enum)
- amount_vnd (bigint)
- commission_vnd (bigint)
- status (enum: pending, confirmed, cancelled, refunded)
- placed_at (timestamp)
- confirmed_at (timestamp, nullable)
- raw_payload (jsonb)
- created_at, updated_at

transactions (ledger)
- id (PK, uuid)
- user_id (FK -> users.id)
- order_id (FK -> orders.id, nullable)
- type (enum: credit, debit, payout, fee)
- amount_vnd (bigint) — positive for credit, negative for debit depending on type semantics
- balance_before (bigint)
- balance_after (bigint)
- status (enum: pending, confirmed, paid)
- reference (string): human readable reference
- created_at, processed_at

withdrawals
- id (PK, uuid)
- user_id (FK -> users.id)
- amount_vnd (bigint)
- fee_vnd (bigint)
- method (string): e.g., bank transfer, momo (future)
- details (jsonb): account info for payout
- status (enum: pending, approved, rejected, paid)
- admin_notes (text, nullable)
- created_at, processed_at

notifications
- id (PK, uuid)
- user_id (FK -> users.id, nullable)
- type (enum: info, success, warning, error)
- channel (enum: in_app, email, zalo)
- payload (jsonb)
- is_read (boolean)
- created_at

admins (optional)
- id (PK)
- user_id (FK -> users.id)
- permissions (jsonb)

integration_adapters
- id (PK)
- name (string): shopee, lazada
- config (jsonb)
- enabled (boolean)
- created_at

jobs
- id (PK)
- type (string)
- payload (jsonb)
- status (enum)
- attempts (int)
- last_error (text)
- created_at, updated_at

jobs_log
- id
- job_id
- message
- created_at

---

3. Quan hệ (Foreign keys)

- users.id 1---* links.user_id
- users.id 1---* orders.user_id (optional)
- users.id 1---* transactions.user_id
- users.id 1---* withdrawals.user_id
- links.id 1---* link_snapshots.link_id
- products.id 1---* link_snapshots.product_id
- links.id 1---* orders.link_id
- orders.id 1---* transactions.order_id
- integration_adapters.id 1---* jobs (optional relationship via payload)

---

4. Indexes (đề xuất)

- users: index(email) unique
- users: index(phone)
- links: index(user_id), index(status), index(source)
- links: index(created_at)
- products: index(external_id, source) unique
- products: index(shop_id)
- orders: index(external_order_id) unique (when provided)
- orders: index(link_id), index(status), index(placed_at)
- transactions: index(user_id), index(status), index(created_at)
- withdrawals: index(user_id), index(status), index(created_at)
- notifications: index(user_id), index(is_read)
- jobs: index(status), index(type)

Notes: Sử dụng partial index cho transactions (status = confirmed) nếu cần báo cáo nhanh.

---

5. Unique keys

- users.email (unique, lowercase normalized)
- products (external_id, source) unique
- links: có thể đặt unique constraint trên hash(source_url) để tránh duplicate init nếu muốn
- orders.external_order_id (unique khi external_id được cung cấp bởi partner)

---

6. Enums (đề xuất)

- user_role: ["user", "admin"]
- link_source: ["shopee", "lazada", "tiki", "other"]
- link_status: ["pending", "done", "failed"]
- order_status: ["pending", "confirmed", "cancelled", "refunded"]
- transaction_type: ["credit", "debit", "payout", "fee"]
- transaction_status: ["pending", "confirmed", "paid"]
- withdrawal_status: ["pending", "approved", "rejected", "paid"]
- notification_type: ["info", "success", "warning", "error"]
- notification_channel: ["in_app", "email", "zalo"]
- token_type: ["access", "refresh"]
- kyc_status: ["none", "pending", "verified", "failed"]

---

7. Luồng dữ liệu (Data flows)

7.1. Paste link -> Generate affiliate link -> Save snapshot
- Frontend (user) gửi POST /api/links với payload: { url }
- Backend tạo record links (status=pending) và enqueue job "link:process"
- Worker lấy job, phân tích URL, gọi adapter_shopee để tạo affiliate_url và lấy product data
- Worker cập nhật products table (upsert) và link_snapshots với snapshot JSON của product
- Worker cập nhật links (affiliate_url, title, thumbnail, price_vnd, status=done)
- Frontend poll hoặc websocket nhận cập nhật và hiển thị

7.2. Order arrives -> Attribution -> Ledger entry
- Khi partner gửi webhook order hoặc admin nhập thủ công (MVP), backend tạo order record (orders)
- Hệ thống cố gắng map order -> link_id dựa trên tracking params hoặc matching product + timeframe
- Khi mapping thành công, tạo transaction (type=credit) với status=pending; cập nhật user's pending balance
- Sau điều kiện xác thực thời gian (ví dụ: lock period), transaction status -> confirmed và cập nhật balance thực tế
- Khi user yêu cầu rút tiền, withdrawals record tạo, và admin xử lý chuyển tiền; sau khi transfer thành công, tạo transaction (type=payout, status=paid) và trừ khỏi balance

7.3. Withdrawal flow (MVP manual)
- User tạo yêu cầu rút tiền (amount >= 2.000 VND)
- Backend validate balance và rules; create withdrawals (status=pending)
- Admin UI hiển thị pending withdrawals; admin kiểm tra & thực hiện chuyển khoản thủ công
- Admin cập nhật withdrawal.status -> approved/paid/rejected; khi paid, system tạo transaction (type=payout)

7.4. Notification flow
- Các events (transaction confirmed, withdrawal updated, link processed) tạo notification record
- Notification dispatcher gửi email/zalo nếu cấu hình và lưu in-app notification

---

Ghi chú vận hành & mở rộng:
- Sử dụng transactions (DB-level) khi cập nhật ledger và balance để tránh race condition
- Có thể tách balances logic: store balance_snapshot trong users hoặc compute từ transactions (recommended: compute on-demand with caching + materialized view)
- Sử dụng background workers để offload network calls và heavy processing
- Trong tương lai, mở rộng cho multi-currency: thêm bảng currencies và conversion_rates

---

Kết luận
- Thiết kế này cân bằng giữa đơn giản (phù hợp MVP) và mở rộng (adapter, worker, ledger immutable). Nếu bạn muốn, bước tiếp theo mình sẽ vẽ ERD mermaid và chuẩn hóa schema fields để dùng với Prisma migrations.