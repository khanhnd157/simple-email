# Simple Email

Ứng dụng email client đơn giản, mã nguồn mở — hỗ trợ giao thức IMAP/SMTP, mã hóa PGP, đa ngôn ngữ (Tiếng Anh & Tiếng Việt).

## Tổng quan

Simple Email được xây dựng theo kiến trúc monorepo gồm 4 package:

| Package | Mô tả |
|---------|-------|
| `packages/core` | Thư viện lõi — IMAP client, SMTP client, mã hóa PGP, parser email, lưu trữ database (Drizzle ORM + libSQL), migration từ Thunderbird |
| `packages/server` | API server (Express 5) — kết nối core để gửi/nhận email qua REST API |
| `packages/desktop` | Ứng dụng desktop (Tauri 2 + React 19 + Vite) — giao diện chính |
| `packages/web` | Phiên bản web (React 19 + Vite) — giao diện tương tự desktop, chạy trên trình duyệt |

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Zustand, TipTap (rich text editor), i18next
- **Backend:** Express 5, TypeScript
- **Core:** ImapFlow, Nodemailer, OpenPGP.js, Drizzle ORM, sql.js
- **Desktop:** Tauri 2 (Rust)
- **Monorepo:** pnpm workspaces + Turborepo

## Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9.15
- [Rust](https://www.rust-lang.org/tools/install) (chỉ cần nếu chạy bản desktop Tauri)

## Cài đặt

```bash
# Clone repo
git clone https://github.com/khanhnd157/simple-email.git
cd simple-email

# Cài dependencies
pnpm install
```

## Chạy môi trường Development

### 1. Chạy tất cả cùng lúc (server + desktop + web)

```bash
pnpm dev
```

Turborepo sẽ chạy song song tất cả các package ở chế độ dev.

### 2. Chạy từng package riêng

**Server API** (port 3001):

```bash
cd packages/server
pnpm dev
```

**Desktop (web UI trong trình duyệt)** (port 1420):

```bash
cd packages/desktop
pnpm dev
```

**Desktop (ứng dụng Tauri):**

```bash
cd packages/desktop
pnpm tauri dev
```

> Cần cài Rust và [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) trước khi chạy Tauri.

**Web** (port 5173):

```bash
cd packages/web
pnpm dev
```

### 3. Build production

```bash
pnpm build
```

## Cấu trúc thư mục

```
simple-email/
├── packages/
│   ├── core/           # Thư viện lõi (IMAP, SMTP, PGP, database)
│   ├── server/         # API server (Express)
│   ├── desktop/        # App desktop (Tauri + React)
│   │   └── src-tauri/  # Rust backend cho Tauri
│   └── web/            # App web (React)
├── docs/               # Tài liệu
├── turbo.json          # Cấu hình Turborepo
├── pnpm-workspace.yaml # Cấu hình pnpm workspaces
└── package.json        # Root scripts
```

## Tính năng chính

- Quản lý nhiều tài khoản email (IMAP/SMTP)
- Soạn email với rich text editor (TipTap)
- Mã hóa & ký email bằng PGP (OpenPGP.js)
- Quản lý filter email
- Hỗ trợ đa ngôn ngữ (EN/VI)
- Import dữ liệu từ Thunderbird
- Giao diện responsive, hỗ trợ resize panel

## License

MIT
