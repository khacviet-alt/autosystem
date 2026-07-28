# PROJECT TREE & BACKLOG

File: TREE.md
Phiên bản: 1.0
Ngày: 2026-07-28

Mục đích: mô tả cấu trúc thư mục dự kiến cho toàn bộ project và backlog chia thành ~70 task có chi tiết mục tiêu, đầu vào, đầu ra, độ khó, thời gian ước tính và phụ thuộc.

---

## 1. Proposed Repository Structure (Tree)

cashback-platform/
├── apps/
│   ├── frontend/             # Next.js 15 app (TS, Tailwind, shadcn/ui)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── app/           # Next 15 app dir
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/      # API clients
│   │   │   └── styles/
│   │   └── package.json
│   └── backend/              # NestJS app (TS)
│       ├── src/
│       │   ├── modules/      # auth, users, links, products, orders, wallet, notifications, admin, integrations
│       │   ├── workers/      # worker entry points
│       │   ├── common/
│       │   ├── main.ts
│       │   └── config/
│       └── package.json
│
├── packages/
│   └── shared/               # shared types, utils, validation schemas
│
├── infra/
│   ├── docker/
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   └── docker-compose.yml
│   ├── k8s/                  # production manifests (future)
│   └── terraform/            # infra as code (optional)
│
├── docs/
│   ├── PROJECT_PLAN.md
│   ├── DATABASE_DESIGN.md
│   ├── ERD.md
│   ├── API_SPEC.md
│   └── TREE.md                # this file
│
├── scripts/                  # dev scripts (migrations, seed, db tools)
├── .github/
│   └── workflows/            # CI/CD pipelines
├── Makefile
└── README.md

---

## 2. Backlog (70 tasks)

Notes:
- Thời gian ước tính sử dụng ngày làm việc (1d = 8h). Một số task nhỏ dùng giờ.
- Độ khó: Low / Medium / High
- Dependencies: liệt kê bằng mã task (Txxx)

### Core infra & project setup

T001 - Init monorepo & repo conventions
- Mục tiêu: Tạo cấu trúc monorepo, code style, .editorconfig, lint, prettier, commit hooks
- Đầu vào: Quyết định tech stack (Next.js, NestJS, Prisma, Postgres, Redis)
- Đầu ra: Skeleton repo, config lint, pre-commit hook
- Độ khó: Low
- Thời gian: 0.5d
- Phụ thuộc: None

T002 - CI baseline (lint + tests)
- Mục tiêu: Thiết lập workflow GitHub Actions chạy lint và unit tests
- Đầu vào: T001
- Đầu ra: .github/workflows/ci.yml chạy lint & test
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T001

T003 - Docker Compose local dev
- Mục tiêu: Tạo docker-compose với Postgres, Redis, backend, frontend
- Đầu vào: Dockerfile skeleton
- Đầu ra: docker-compose.yml chạy local full-stack
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T001

T004 - Init backend (NestJS skeleton)
- Mục tiêu: Khởi tạo app NestJS với cấu trúc module cơ bản
- Đầu vào: T001
- Đầu ra: backend/src skeleton, package.json
- Độ khó: Low
- Thời gian: 0.5d
- Phụ thuộc: T001

T005 - Init frontend (Next.js skeleton)
- Mục tiêu: Khởi tạo Next.js 15 app với Tailwind và shadcn/ui basic setup
- Đầu vào: T001
- Đầu ra: frontend app skeleton
- Độ khó: Low
- Thời gian: 0.5d
- Phụ thuộc: T001

T006 - Init Prisma & DB migrations baseline
- Mục tiêu: Cài Prisma, kết nối Postgres, tạo migration initial
- Đầu vào: T003, T004
- Đầu ra: prisma/schema.prisma, migration folder
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T003, T004

T007 - Setup Redis + BullMQ skeleton
- Mục tiêu: Thêm config Redis + queue worker skeleton (BullMQ)
- Đầu vào: T003, T004
- Đầu ra: worker config, sample job
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T003, T004


### Auth & User Management

T008 - Implement Auth module design (spec)
- Mục tiêu: Soạn spec chi tiết endpoints, token flows cho JWT + refresh
- Đầu vào: API_SPEC.md
- Đầu ra: Auth API spec, DB tables (auth_tokens)
- Độ khó: Low
- Thời gian: 0.5d
- Phụ thuộc: T006

T009 - Implement register & login endpoints (backend)
- Mục tiêu: Thực thi register/login với JWT issuance, refresh token storage
- Đầu vào: T008, T006
- Đầu ra: /auth/register, /auth/login, auth_tokens table
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T008, T006

T010 - Frontend auth pages (register/login)
- Mục tiêu: UI cho đăng ký/đăng nhập, form validation
- Đầu vào: T009
- Đầu ra: /auth pages, integration with API
- Độ khó: Low
- Thời gian: 2d
- Phụ thuộc: T009, T005

T011 - Implement refresh & logout
- Mục tiêu: Endpoint refresh token & logout (revoke)
- Đầu vào: T009
- Đầu ra: /auth/refresh, /auth/logout
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T009

T012 - User profile endpoints & UI
- Mục tiêu: Implement GET/PATCH /users/me and frontend profile page
- Đầu vào: T009, T010
- Đầu ra: profile API + UI
- Độ khó: Low
- Thời gian: 1d
- Phụ thuộc: T009, T010


### Link flow (core feature)

T013 - Link DB model & migration
- Mục tiêu: Tạo bảng links & link_snapshots trong Prisma
- Đầu vào: DATABASE_DESIGN.md, T006
- Đầu ra: migration for links & snapshots
- Độ khó: Medium
- Thời gian: 0.5d
- Phụ thuộc: T006

T014 - Implement POST /links (backend)
- Mục tiêu: Endpoint nhận sourceUrl, validate, create link record and enqueue job
- Đầu vào: T013, T007
- Đầu ra: links record (status=pending), job enqueued
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T013, T007, T009

T015 - Simple Shopee adapter (worker)
- Mục tiêu: Implement rule-based transformation to affiliate link + fetch product preview via public endpoints/scrape
- Đầu vào: T014
- Đầu ra: affiliate_url, product metadata returned; update link record
- Độ khó: High
- Thời gian: 3d
- Phụ thuộc: T014, T007

T016 - Worker processing pipeline (link job)
- Mục tiêu: Implement worker to process link jobs, persist product and snapshot, handle retries/errors
- Đầu vào: T014, T015
- Đầu ra: updated links record, products upsert, link_snapshots
- Độ khó: High
- Thời gian: 2d
- Phụ thuộc: T014, T015, T007

T017 - Frontend paste link flow (UI)
- Mục tiêu: Component for pasting link, show pending state and preview when ready
- Đầu vào: T014, T015
- Đầu ra: UI with paste area, preview card
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T014, T015, T010

T018 - Links list & detail UI
- Mục tiêu: User can view history of links, filter, open detail view
- Đầu vào: T014, T017
- Đầu ra: links list page, detail modal/page
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T017, T013

T019 - Idempotency & dedupe link creation
- Mục tiêu: Prevent duplicate link records for identical URLs; return existing record if recently processed
- Đầu vào: T013, T014
- Đầu ra: idempotent POST /links behavior
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T013, T014


### Product management

T020 - Products model & migration
- Mục tiêu: Tạo bảng products với fields cơ bản và index
- Đầu vào: DATABASE_DESIGN.md, T006
- Đầu ra: migration for products
- Độ khó: Medium
- Thời gian: 0.5d
- Phụ thuộc: T006

T021 - Product upsert logic (worker)
- Mục tiêu: Worker upserts external product data into products table with last_synced_at
- Đầu vào: T015, T020
- Đầu ra: products entries
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T015, T020

T022 - Product search endpoint & UI
- Mục tiêu: Implement GET /products?q= and frontend search UI
- Đầu vào: T020
- Đầu ra: searchable product list
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T020, T005

T023 - Periodic product sync job
- Mục tiêu: Schedule worker to refresh price & thumbnail for cached products (rate-limited)
- Đầu vào: T021
- Đầu ra: job schedule & worker process
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T021, T007


### Orders & Reconciliation

T024 - Orders model & migration
- Mục tiêu: Tạo bảng orders trong DB
- Đầu vào: DATABASE_DESIGN.md
- Đầu ra: migration for orders
- Độ khó: Medium
- Thời gian: 0.5d
- Phụ thuộc: T006

T025 - Webhook receiver skeleton (/orders POST)
- Mục tiêu: Endpoint to receive order payload from partners (initially manual/admin POST allowed)
- Đầu vào: T024
- Đầu ra: orders rows created, validation
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T024, T009 (auth for admin)

T026 - Attribution algorithm (map order -> link)
- Mục tiêu: Implement logic trying multiple heuristics: tracking token, redirect param, product+time window
- Đầu vào: orders, links, link_snapshots
- Đầu ra: link_id assigned to order or null
- Độ khó: High
- Thời gian: 3d
- Phụ thuộc: T024, T013, T016

T027 - Create pending transaction upon mapped order
- Mục tiêu: Create transaction ledger entry status=pending when order maps to link
- Đầu vào: T026
- Đầu ra: transactions row reserved
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T026, T024

T028 - Manual order reconciliation admin tool
- Mục tiêu: Admin UI to match orders to links and resolve disputes
- Đầu vào: T025, T026
- Đầu ra: admin endpoint/UI
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T025, T026

T029 - Order confirmation lifecycle (pending -> confirmed)
- Mục tiêu: Implement scheduled job to move pending transactions to confirmed after business rules
- Đầu vào: T027
- Đầu ra: transaction status updated, wallet available balance updated
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T027, T007


### Wallet & Transactions

T030 - Transactions (ledger) model & migration
- Mục tiêu: Tạo table transactions theo design immutable ledger
- Đầu vào: DATABASE_DESIGN.md
- Đầu ra: migration
- Độ khó: Medium
- Thời gian: 0.5d
- Phụ thuộc: T006

T031 - Compute balance API & caching
- Mục tiêu: GET /wallet returns pending and available balances computed from transactions; cache for performance
- Đầu vào: T030
- Đầu ra: wallet endpoint
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T030

T032 - Create transaction service (atomic)
- Mục tiêu: Service to create transaction and ensure balance_before/after correctness using DB transaction
- Đầu vào: T030
- Đầu ra: reusable service used by order mapping and withdrawals
- Độ khó: High
- Thời gian: 2d
- Phụ thuộc: T030


### Withdrawals & Payouts (MVP manual)

T033 - Withdrawals model & migration
- Mục tiêu: Tạo withdrawals table
- Đầu vào: DATABASE_DESIGN.md
- Đầu ra: migration
- Độ khó: Low
- Thời gian: 0.5d
- Phụ thuộc: T006

T034 - POST /withdrawals endpoint (user)
- Mục tiêu: Create withdrawal record; validate min amount 2000 VND and available balance; create reserved transaction
- Đầu vào: T033, T031, T032
- Đầu ra: withdrawal record pending
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T033, T031, T032, T009

T035 - Admin withdrawal processing UI
- Mục tiêu: Admin can view pending withdrawals and mark approved/paid/rejected
- Đầu vào: T033
- Đầu ra: admin UI/endpoint
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T033, T009

T036 - Refund & rejection flow
- Mục tiêu: On rejection, release reserved funds and create appropriate transaction entries
- Đầu vào: T035, T032
- Đầu ra: withdrawn funds released; audit log
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T035, T032


### Notifications

T037 - Notifications model & migration
- Mục tiêu: Tạo notifications table
- Đầu vào: DATABASE_DESIGN.md
- Đầu ra: migration
- Độ khó: Low
- Thời gian: 0.5d
- Phụ thuộc: T006

T038 - Notification dispatcher service
- Mục tiêu: Service to enqueue & deliver in-app + email notifications
- Đầu vào: T037, email provider config
- Đầu ra: notification records & outbound emails
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T037, T007

T039 - Frontend notification center & toasts
- Mục tiêu: UI to read in-app notifications and mark them read
- Đầu vào: T038, T010
- Đầu ra: UI component
- Độ khó: Low
- Thời gian: 1d
- Phụ thuộc: T038, T010


### Admin & Dashboard

T040 - Admin auth + RBAC enforcement
- Mục tiêu: Role checks for admin endpoints and admin seed user
- Đầu vào: T009
- Đầu ra: role based middleware
- Độ khó: Medium
- Thời gian: 0.5d
- Phụ thuộc: T009

T041 - Admin overview endpoint (KPIs)
- Mục tiêu: Implement /admin/overview summarizing users, links, pending withdrawals
- Đầu vào: T030, T033
- Đầu ra: metrics API
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T030, T033

T042 - Admin user management UI
- Mục tiêu: CRUD users, deactivate/reactivate
- Đầu vào: T009, T040
- Đầu ra: admin UI
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T009, T040


### Frontend common & UX

T043 - Design system & components (shadcn/ui)
- Mục tiêu: Build base components: Button, Modal, Input, Table, Toast
- Đầu vào: shadcn/ui
- Đầu ra: shared component library
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T005

T044 - Responsive layout & header/nav
- Mục tiêu: App shell, header, responsive nav and auth guard
- Đầu vào: T043
- Đầu ra: app layout
- Độ khó: Low
- Thời gian: 1d
- Phụ thuộc: T043

T045 - Forms validation & client-side schemas
- Mục tiêu: Shared validation library for forms (zod/yup)
- Đầu vào: packages/shared
- Đầu ra: validation schemas
- Độ khó: Low
- Thời gian: 1d
- Phụ thuộc: T001


### Observability, logging & testing

T046 - Logging & error tracking (Sentry)
- Mục tiêu: Integrate Sentry for backend and frontend
- Đầu vào: Sentry account
- Đầu ra: Sentry integration, basic error groups
- Độ khó: Low
- Thời gian: 0.5d
- Phụ thuộc: T004, T005

T047 - Metrics (Prometheus) & Grafana dashboards
- Mục tiêu: Expose metrics and create basic dashboards
- Đầu vào: infra access
- Đầu ra: metrics endpoints, dashboards
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T003

T048 - E2E tests for core flow (paste link -> affiliate -> order -> wallet)
- Mục tiêu: Cypress or Playwright tests covering main user journey
- Đầu vào: running app in CI/staging
- Đầu ra: E2E test suite
- Độ khó: High
- Thời gian: 3d
- Phụ thuộc: T017, T016, T027

T049 - Load testing for worker pipeline
- Mục tiêu: Simulate high volume link processing and order ingestion
- Đầu vào: test scripts, infra test env
- Đầu ra: load test results and bottleneck findings
- Độ khó: High
- Thời gian: 3d
- Phụ thuộc: T016, T007


### Security & Compliance

T050 - OWASP checklist & security hardening
- Mục tiêu: Review app against OWASP and implement essential mitigations
- Đầu vào: codebase
- Đầu ra: security fixes & checklist done
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T009, T014

T051 - Secrets management & env configuration
- Mục tiêu: Integrate secret manager (Vault or cloud secret manager) for production
- Đầu vào: infra
- Đầu ra: secret store usage in CI/CD
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T003

T052 - Rate limiting & abuse protection
- Mục tiêu: Add rate limits to endpoints (auth, /links) and IP throttling
- Đầu vào: traffic patterns
- Đầu ra: rate limit middleware
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T009, T014


### Integrations & adapters

T053 - Shopee adapter (robust) + unit tests
- Mục tiêu: Harden adapter: handle redirects, token extraction, affiliate creation and error cases
- Đầu vào: T015
- Đầu ra: production-ready adapter + tests
- Độ khó: High
- Thời gian: 4d
- Phụ thuộc: T015, T016

T054 - Integration config UI (admin) for adapters
- Mục tiêu: Allow admin to manage adapter configs (enable/disable, creds)
- Đầu vào: T053, integration_adapters table
- Đầu ra: admin UI & API
- Độ khó: Medium
- Thời gian: 1.5d
- Phụ thuộc: T053, T040

T055 - Prepare integration test harness (mock partner)
- Mục tiêu: Test partner webhooks and simulate order payloads
- Đầu vào: webhook schemas
- Đầu ra: test harness & fixtures
- Độ khó: Medium
- Thời gian: 1.5d
- Phụ thuộc: T025, T053


### DevOps & deployment

T056 - Production Docker images & manifests
- Mục tiêu: Build optimized Docker images and basic k8s manifests
- Đầu vào: backend/frontend builds
- Đầu ra: Dockerfiles, k8s manifests or prod compose
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T003, T004, T005

T057 - CI/CD deploy to staging
- Mục tiêu: Pipeline to build, test and deploy to staging environment
- Đầu vào: CI baseline
- Đầu ra: staging deployment
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T002, T056

T058 - Backup & restore strategy for Postgres
- Mục tiêu: Define and implement backup schedule and restore runbook
- Đầu vào: infra access
- Đầu ra: backup scripts & docs
- Độ khó: Medium
- Thời gian: 1.5d
- Phụ thuộc: T003

T059 - Health checks & startup probes
- Mục tiêu: Implement health endpoints for backend and worker
- Đầu vào: app code
- Đầu ra: /health endpoints, readiness/liveness
- Độ khó: Low
- Thời gian: 0.5d
- Phụ thuộc: T004


### Documentation & QA

T060 - API OpenAPI spec generation
- Mục tiêu: Convert API_SPEC.md into OpenAPI YAML and publish docs
- Đầu vào: API_SPEC.md
- Đầu ra: openapi.yaml + docs site (e.g., Swagger)
- Độ khó: Medium
- Thời gian: 1.5d
- Phụ thuộc: API_SPEC.md (existing)

T061 - ERD -> Prisma schema translation
- Mục tiêu: Map ERD to prisma schema and ensure constraints
- Đầu vào: DATABASE_DESIGN.md, ERD.md
- Đầu ra: prisma/schema.prisma draft
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T006, DATABASE_DESIGN.md

T062 - README + onboarding docs
- Mục tiêu: Create developer onboarding docs: setup, run, conventions
- Đầu vào: repository
- Đầu ra: README + CONTRIBUTING
- Độ khó: Low
- Thời gian: 1d
- Phụ thuộc: T001

T063 - Create sample data & seed scripts
- Mục tiêu: Seed DB with test users, sample products, links for dev/testing
- Đầu vào: prisma schema
- Đầu ra: seed scripts
- Độ khó: Low
- Thời gian: 1d
- Phụ thuộc: T061

T064 - Accessibility review (frontend)
- Mục tiêu: Check major pages for a11y issues and fix critical ones
- Đầu vào: frontend UI
- Đầu ra: fixes and report
- Độ khó: Medium
- Thời gian: 1d
- Phụ thuộc: T043, T044

T065 - Internationalization (i18n) scaffold
- Mục tiêu: Add i18n support for VN locale (future multi-language)
- Đầu vào: frontend
- Đầu ra: i18n framework + VN locale strings
- Độ khó: Low
- Thời gian: 1d
- Phụ thuộc: T005


### Advanced features & non-blocking

T066 - Zalo bot PoC (integration)
- Mục tiêu: Build PoC to receive messages and reply with user balance or help
- Đầu vào: Zalo dev account
- Đầu ra: simple bot + docs
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T009, T031

T067 - Referral & campaign system skeleton
- Mục tiêu: Design DB & endpoints for referral code and campaign tracking
- Đầu vào: product requirements
- Đầu ra: schema + API endpoints scaffold
- Độ khó: Medium
- Thời gian: 2d
- Phụ thuộc: T013, T030

T068 - Fraud detection basic rules engine
- Mục tiêu: Implement basic suspicious patterns and alerting (rate, abnormally high conversions)
- Đầu vào: logs & events
- Đầu ra: rules, alerts in admin
- Độ khó: High
- Thời gian: 3d
- Phụ thuộc: T047, T046

T069 - Payment gateway payout integration (V2)
- Mục tiêu: Integrate with payment provider (sandbox) to automate payouts
- Đầu vào: payment provider docs
- Đầu ra: payout service, tests
- Độ khó: High
- Thời gian: 5d
- Phụ thuộc: T035, T033, T032

T070 - Performance & DB optimization sprint
- Mục tiêu: Optimize heavy queries, add indexes/partitions, tune workers
- Đầu vào: load test results
- Đầu ra: improved performance, tuning docs
- Độ khó: High
- Thời gian: 3d
- Phụ thuộc: T049, T021, T030

---

## 3. Prioritization (Suggested)

Phase 1 (MVP): T001-T036, T037-T043, T059-T063
Phase 2 (stability & testing): T044-T049, T050-T055
Phase 3 (scale & integrations): T056-T070

---

## 4. How to use this backlog

- Import tasks into project management tool (Jira/Trello) using task IDs as reference.
- Track time vs estimates and reprioritize depending on discovery.
- Break larger tasks (High) into subtasks if needed.

---

Nếu bạn đồng ý với cấu trúc và backlog này, mình sẽ commit file TREE.md vào repository. Mình cũng có thể xuất backlog ra CSV/JSON để import vào Jira hoặc GitHub Issues tự động.