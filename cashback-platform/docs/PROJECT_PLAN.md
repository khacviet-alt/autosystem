# PROJECT PLAN — Cashback Affiliate Platform (AnBong-like)

Phiên bản tài liệu: 1.0
Ngày: 2026-07-28
Tác giả: Software Architecture Team

Mục tiêu tài liệu: mô tả phạm vi, kiến trúc, module, luồng nghiệp vụ và lộ trình phát triển cho nền tảng Cashback Affiliate (gọi tắt là "Cashback Platform"). Tài liệu này dành cho đội phát triển, QA, DevOps và Product.

---

1. Mục tiêu dự án

- Xây dựng nền tảng cho phép người dùng chuyển đổi link sản phẩm (ví dụ: Shopee) thành affiliate link để thu hoa hồng.
- Hiển thị đầy đủ thông tin sản phẩm khi người dùng dán link.
- Lưu lịch sử link và theo dõi trạng thái đơn hàng phát sinh từ link đó.
- Tính toán và ghi nhận cashback vào ví người dùng, hỗ trợ rút tiền.
- Hệ thống thông báo (trực tiếp & email/in-app) khi có sự kiện quan trọng (cashback ghi nhận, đơn hàng thay đổi trạng thái, rút tiền...).
- Tạo nền tảng mở để tích hợp bot Zalo và các kênh tương tác khác sau này.

Mục tiêu phi chức năng chính:
- Bảo mật tài khoản & dữ liệu người dùng.
- Độ sẵn sàng cao, khả năng mở rộng theo số lượng người dùng và luồng xử lý affiliate.
- Dễ triển khai bằng Docker, có cấu hình cho staging & production.

---

2. Danh sách chức năng MVP (Minimum Viable Product)

2.1. Người dùng & Authentication
- Đăng ký / đăng nhập (email + mật khẩu, OTP cho mobile optional)
- Quản lý profile cơ bản

2.2. Chức năng core
- Trang dán link: người dùng dán một link Shopee
- Chuyển đổi link: hệ thống chuyển link gốc thành affiliate link
- Hiển thị thông tin sản phẩm (tối thiểu: tên, ảnh, giá, tồn kho ước tính, link affiliate)
- Lưu lịch sử link của người dùng (timestamp, link gốc, link affiliate, trạng thái)

2.3. Theo dõi đơn hàng & cashback
- Cơ sở để liên kết đơn hàng với link affiliate (tracking token/transaction id)
- Ghi nhận cashback tạm thời và trạng thái: pending -> confirmed -> paid
- Ví cashback: hiển thị số dư hiện tại, lịch sử giao dịch
- Quy trình rút tiền (yêu cầu: gửi yêu cầu; xử lý thủ công/ bán tự động trong MVP)

2.4. Thông báo
- In-app notification khi cashback thay đổi trạng thái
- Email notification cho các sự kiện chính (đăng ký, rút tiền, cashback confirmed)

2.5. Admin (basic)
- Dashboard admin xem tổng quan: người dùng, số link, tổng cashback, yêu cầu rút tiền
- Quản lý và xử lý yêu cầu rút tiền

2.6. Hạ tầng & DevOps cơ bản
- Dockerfile cho frontend & backend
- Docker Compose cho local development (PostgreSQL, Redis, backend, frontend)
- Migrations bằng Prisma

---

3. Danh sách chức năng Version 2 (sau MVP)

3.1. Tự động hoá rút tiền (kết nối payment gateway)
3.2. Tự động sync đơn hàng với đối tác (API/webhook từ nền tảng e-commerce hoặc affiliate network)
3.3. Hệ thống affiliate link builder hỗ trợ nhiều sàn (Shopee, Lazada, Tiki, ...)
3.4. Bot Zalo & Omni-channel notifications (Zalo, SMS, Telegram)
3.5. Hệ thống khuyến khích (referral, promo codes, campaigns)
3.6. UI/UX nâng cao: editor link, enhanced product card, price history
3.7. Analytics & reporting: cohort, LTV, conversion funnel
3.8. Fraud detection: rules engine & scoring
3.9. Thêm roles & permissions, multi-tenant (nếu cần thương mại hóa cho đối tác)

---

4. Kiến trúc hệ thống

Tổng quan kiến trúc (high-level):
- Frontend: Next.js 15 + TypeScript + TailwindCSS + shadcn/ui (SSG/SSR cho SEO, client-side interactions)
- Backend API: NestJS (TypeScript) — RESTful + GraphQL (tùy chọn sau) để phục vụ frontend và tích hợp
- Persistence: PostgreSQL (chính) + Prisma ORM
- Cache & Queue: Redis (cache, session, job queue với BullMQ hoặc Redis Streams)
- Background workers: chạy các job chuyển đổi link, crawl thông tin sản phẩm, reconcile đơn hàng, xử lý thanh toán rút tiền
- External integrations: Affiliate network APIs, Shopee partner APIs, payment gateway, Zalo bot API
- Observability: Prometheus + Grafana (metrics), ELK/Opensearch cho logs, Sentry cho lỗi ứng dụng
- Deployment: Docker → orchestration (Kubernetes hoặc Docker Compose for small-scale)

Component diagram (miêu tả):
- Client (Next.js) ↔ API Gateway (NestJS REST) ↔ Services (internal modules)
- Services ↔ PostgreSQL
- Queue (Redis/BullMQ) ↔ Workers
- Workers ↔ External APIs (Shopee, Affiliate networks)
- Notifications service ↔ Email provider / Zalo bot / Push

Bảo mật & vận hành:
- JWT + Refresh tokens, HTTP-only secure cookies cho web
- Role-based access control cho admin API
- TLS everywhere, secrets quản lý bằng Vault/Secret Manager
- Backup định kỳ cho Postgres, replication và read replicas khi scale

---

5. Module Backend (chi tiết theo bounded context)

5.1. Auth Module
- Đăng ký, đăng nhập, reset password, refresh token
- Quản lý profile, OTP (nếu cần), MFA (future)

5.2. User Module
- Profile, settings, KYC metadata (nếu cần cho rút tiền)

5.3. Link Processing Module
- Nhận link người dùng, phân tích nguồn (Shopee, v.v.)
- Tạo affiliate link qua rules/adapter cho từng network
- Lưu bản ghi link, hash/ID để tracking

5.4. Product Module
- Lấy thông tin sản phẩm (title, images, price, shop)
- Caching product snapshot để tránh bị rate-limited
- Schema đồng nhất cho nhiều nguồn

5.5. Order Tracking Module
- Gán order -> link (attribution)
- Nhận dữ liệu đơn hàng từ external (webhook / polling)
- Trạng thái đơn hàng & reconcile trạng thái cashback

5.6. Wallet & Payments Module
- Wallet balance, ledger (immutable transaction log)
- Yêu cầu rút tiền, trạng thái rút tiền
- Tích hợp payment gateway (payout) ở V2

5.7. Notifications Module
- In-app notification store
- Email/SMS/Zalo sender interface, templates

5.8. Admin Module
- Reports, xử lý rút tiền, quản lý user/link

5.9. Integration Adapters
- Shopee adapter, Affiliate network adapter, Payment adapter, Zalo bot adapter

5.10. Background Workers
- Job queue processors: link conversion jobs, product scrape/update, order reconcile, notification dispatch

5.11. Monitoring & Ops
- Health checks, metrics endpoints, logs

---

6. Module Frontend (khung chức năng)

6.1. Public & Auth pages
- Landing page, marketing copy
- Đăng ký / đăng nhập / profile pages

6.2. Dashboards
- User dashboard: tổng quan số dư, recent links, recent cashback
- Admin dashboard: KPIs, pending payouts, user management

6.3. Link Flow UI
- Paste link component (clipboard paste / input)
- Product preview card với thông tin trích xuất
- CTA: "Tạo affiliate link" / "Sao chép affiliate link"
- Lịch sử link với bộ lọc & pagination

6.4. Orders & Cashback
- Trang chi tiết lịch sử đơn hàng liên quan
- Ví & rút tiền flows (form rút, confirm, status)

6.5. Notifications
- In-app notification center, toast messages

6.6. Các tiện ích UI
- Modal confirm, toasts, loaders, responsive layout

---

7. Luồng nghiệp vụ (use cases chính)

7.1. Luồng: Người dùng dán link -> nhận affiliate link
- Người dùng paste link Shopee vào UI
- Frontend gọi API Link Processing: POST /links
- Backend tạo job xử lý: phân tích link, chọn adapter, tạo affiliate link
- Worker thực thi job, lấy affiliate link, cập nhật record và snapshot sản phẩm
- Frontend polling / websocket nhận kết quả và hiển thị product card + affiliate link
- User có thể lưu vào lịch sử hoặc sao chép link

7.2. Luồng: Đơn hàng & ghi nhận cashback
- Khi có đơn hàng phát sinh từ affiliate link, source (affiliate network hoặc sàn) gửi webhook/payload
- Order Tracking Module reconcile order với link record -> xác định user
- Tạo transaction ledger: cashback pending
- Sau điều kiện xác nhận (ví dụ: hoàn tất giao hàng, không bị hoàn trả), đổi trạng thái thành confirmed
- Wallet được cập nhật (credit) khi confirmed
- Gửi notification cho user

7.3. Luồng: Yêu cầu rút tiền
- User tạo yêu cầu rút tiền từ UI
- Backend kiểm tra số dư, rules rút tiền (minimum, fees)
- Tạo payout record: pending
- Admin/Cron xử lý payout: gọi payment gateway hoặc xử lý thủ công
- Khi payout success -> cập nhật ledger -> mark as paid
- Gửi notification & email

7.4. Luồng: Đồng bộ & xử lý dữ liệu sản phẩm
- Worker chạy định kỳ: cập nhật giá, tồn kho (nếu nguồn cho phép)
- Nếu không có API chính thức, sử dụng caching và giới hạn tần suất crawl

---

8. Roadmap chia thành nhiều Sprint (đề xuất: sprint 2 tuần)

Sprint 0 (Chuẩn bị, 1 tuần):
- Thiết lập repo, conventions, CI baseline
- Dockerfile + Docker Compose (Postgres, Redis, backend, frontend)
- Skeleton backend (NestJS) + Prisma init, migrations
- Skeleton frontend (Next.js + Tailwind + shadcn/ui)
- Docs cơ bản: API spec outline, ERD sơ bộ

Sprint 1 (2 tuần):
- Auth module (backend) + frontend auth flows
- User profile & DB schema
- Basic admin user
- Local deployment hoàn chỉnh

Sprint 2 (2 tuần):
- Link Processing API (endpoint nhận link + tạo record)
- Background worker skeleton & job queue
- Simple Shopee adapter (rule-based URL transformation)
- Frontend Paste Link flow + product preview (mocked data)

Sprint 3 (2 tuần):
- Product module: snapshot & caching
- Implement product info extraction (adapter)
- Lưu lịch sử link & UI history
- In-app notifications basic

Sprint 4 (2 tuần):
- Order Tracking skeleton & reconciliation model
- Wallet & ledger model
- Basic admin: view requests, users

Sprint 5 (2 tuần):
- Withdrawal request flow (frontend + backend)
- Email notifications & templates
- Add monitoring & logging basics

Sprint 6 (2 tuần):
- Integrate with real affiliate APIs / improve adapter
- Harden link attribution & reconciliation
- Add tests (unit + integration) for core flows

Sprint 7 (2 tuần):
- Performance tuning, caching strategies
- Security review, pen-test checklist
- Prepare production deployment (CI/CD pipelines)

Sprint 8+ (ongoing):
- Payment gateway payout automation
- Zalo bot integration
- Analytics, fraud detection, additional marketplaces

---

9. Những phần khó nhất của dự án

- Reliable link conversion & attribution: các affiliate network có rule khác nhau, token lifecycle, redirect chains, tracking parameters.
- Order tracking & reconciliation: phụ thuộc vào dữ liệu từ bên thứ ba (webhook/polling) với độ trễ/thiếu sót; map order->link chính xác trong mọi trường hợp.
- Product data consistency: giá, hình ảnh, tồn kho thay đổi nhanh và sàn có thể chặn scraping.
- Financial integrity: ledger bất biến, double-spend prevention, accurate accounting cho cashback và payouts.
- Scalability của background jobs khi số lượng link và đơn hàng tăng đột biến.

---

10. Rủi ro kỹ thuật và biện pháp giảm thiểu

Rủi ro: Thay đổi API / Rate limits / Anti-scraping
- Giảm thiểu: thiết kế adapter có khả năng fallback (multiple sources), cache mạnh, backoff và retry with jitter, rotate proxies nếu cần.

Rủi ro: Attribution inaccuracies dẫn tới tranh chấp payout
- Giảm thiểu: lưu snapshot, log đầy đủ các bước, ID tracking end-to-end, audit trail cho mỗi giao dịch cashback.

Rủi ro: Fraud / Abuse
- Giảm thiểu: giới hạn tần suất, rules engine, flag suspicious patterns, manual review cho payouts lớn.

Rủi ro: Data loss / corruption
- Giảm thiểu: backup định kỳ, migrations có review, schema versioning, read-replicas để phân tải

Rủi ro: Pháp lý & compliance
- Giảm thiểu: review chính sách affiliate networks, tuân thủ tax/financial regulations, KYC for large payouts

Rủi ro: Scalability & performance
- Giảm thiểu: thiết kế theo bounded contexts, dùng Redis cache, queue workers, scale workers horizontally, database indexing & partitioning

---

Appendix: Kiểm thử & chất lượng
- Unit tests cho business logic, integration tests cho adapter (mocks), e2e cho flows chính
- Load testing cho worker pipeline và API endpoints quan trọng
- Security review: OWASP checklist, secure secrets, rate limiting

Kết luận
- Kế hoạch trên cung cấp lộ trình rõ ràng từ MVP đến V2, tập trung vào reliability của attribution, integrity cho hệ thống tài chính và khả năng mở rộng dần.
- Tiếp theo: nếu bạn đồng ý, mình sẽ tạo SPEC chi tiết API và ERD để bắt đầu sprint 0, hoặc cập nhật phần nào bạn muốn thay đổi về ưu tiên.
