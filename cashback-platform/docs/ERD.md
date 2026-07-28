# ERD — Cashback Affiliate Platform (Mermaid)

Phiên bản: 1.0  
Ngày: 2026-07-28

Lưu ý: hệ thống ban đầu chỉ hỗ trợ Shopee. Tiền tệ mặc định: VND. Min withdrawal = 2.000 VND. Payout ban đầu xử lý thủ công.

```mermaid
erDiagram
  USERS {
    UUID id PK
    string email
    string password_hash
    string full_name
    string phone
    enum role
    enum kyc_status
    timestamp created_at
    timestamp updated_at
    boolean is_active
  }

  AUTH_TOKENS {
    UUID id PK
    UUID user_id FK
    enum token_type
    string token_hash
    timestamp expires_at
    boolean revoked
    timestamp created_at
  }

  LINKS {
    UUID id PK
    UUID user_id FK
    text source_url
    enum source
    text affiliate_url
    string title
    string thumbnail
    bigint price_vnd
    enum currency
    enum status
    jsonb metadata
    timestamp created_at
    timestamp updated_at
  }

  PRODUCTS {
    UUID id PK
    string external_id
    enum source
    string title
    string thumbnail_url
    bigint current_price_vnd
    enum currency
    string shop_id
    timestamp last_synced_at
    timestamp created_at
    timestamp updated_at
  }

  LINK_SNAPSHOTS {
    UUID id PK
    UUID link_id FK
    UUID product_id FK
    jsonb snapshot
    timestamp created_at
  }

  ORDERS {
    UUID id PK
    string external_order_id
    UUID user_id FK
    UUID link_id FK
    UUID product_id FK
    enum source
    bigint amount_vnd
    bigint commission_vnd
    enum status
    timestamp placed_at
    timestamp confirmed_at
    jsonb raw_payload
    timestamp created_at
    timestamp updated_at
  }

  TRANSACTIONS {
    UUID id PK
    UUID user_id FK
    UUID order_id FK
    enum type
    bigint amount_vnd
    bigint balance_before
    bigint balance_after
    enum status
    string reference
    timestamp created_at
    timestamp processed_at
  }

  WITHDRAWALS {
    UUID id PK
    UUID user_id FK
    bigint amount_vnd
    bigint fee_vnd
    string method
    jsonb details
    enum status
    text admin_notes
    timestamp created_at
    timestamp processed_at
  }

  NOTIFICATIONS {
    UUID id PK
    UUID user_id FK
    enum type
    enum channel
    jsonb payload
    boolean is_read
    timestamp created_at
  }

  INTEGRATION_ADAPTERS {
    UUID id PK
    string name
    jsonb config
    boolean enabled
    timestamp created_at
  }

  JOBS {
    UUID id PK
    string type
    jsonb payload
    enum status
    int attempts
    text last_error
    timestamp created_at
    timestamp updated_at
  }

  %% Relationships
  USERS ||--o{ LINKS : "1..n"
  USERS ||--o{ ORDERS : "1..n"
  USERS ||--o{ TRANSACTIONS : "1..n"
  USERS ||--o{ WITHDRAWALS : "1..n"
  USERS ||--o{ NOTIFICATIONS : "1..n"
  USERS ||--o{ AUTH_TOKENS : "1..n"

  LINKS ||--o{ LINK_SNAPSHOTS : "1..n"
  LINKS ||--o{ ORDERS : "1..n"
  PRODUCTS ||--o{ LINK_SNAPSHOTS : "1..n"
  PRODUCTS ||--o{ ORDERS : "1..n"

  ORDERS ||--o{ TRANSACTIONS : "1..n"

  INTEGRATION_ADAPTERS ||--o{ JOBS : "1..n"
```

Ghi chú:
- PK = primary key, FK = foreign key.
- Enums chi tiết và ràng buộc xem DATABASE_DESIGN.md.
- Ledger (transactions) là nguồn chân xác cho balance; balance có thể được tính từ tổng transactions confirmed hoặc lưu snapshot để tối ưu.
