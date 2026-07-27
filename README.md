# QuickCart — Full-Stack E-Commerce Store

A full-stack e-commerce platform built as an SDE Intern take-home assignment. Includes a customer storefront, an admin panel, secure authentication, and real payment integration in test mode.

**Live Demo:** [add your deployed URL here]
**GitHub Repo:** https://github.com/DIPAL1209/QuickCart-Product

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack Decisions & Tradeoffs](#tech-stack-decisions--tradeoffs)
- [Setup & Local Run Instructions](#setup--local-run-instructions)
- [Feature List](#feature-list)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Demo Credentials & Test Payment](#demo-credentials--test-payment)

---

## Architecture Overview

QuickCart follows a **modular, layered architecture** with a clear separation between frontend, backend, and database.

```
QuickCart/
├── frontend/                 # Next.js app (customer storefront + admin panel)
│   └── src/
│       ├── app/               # Pages (App Router): home, product, cart, checkout, orders, admin/*
│       ├── components/        # Reusable UI components (ProductCard, Navbar, ConfirmModal, etc.)
│       ├── context/            # React Context: AuthContext, CartContext
│       └── lib/                 # Axios instance, helper utilities
│
└── backend/                   # Node.js + Express REST API
    └── src/
        ├── config/              # Environment-based config, Supabase client
        ├── controller/          # Business logic (auth, products, orders, payment, admin)
        ├── middleware/          # JWT auth check, admin-only guard, centralized error handler
        ├── routes/v1/           # Versioned REST routes
        └── validation/          # Request schema validation (zod)
```

**Request flow (example — placing an order):**

1. Customer adds items to cart (stored client-side in `localStorage` via `CartContext`).
2. On checkout, frontend calls `POST /api/v1/orders` → backend validates stock, calculates total, creates an order with status `pending`, and creates `order_items` rows.
3. Frontend calls `POST /api/v1/payment/create-order` → backend creates a matching Razorpay order.
4. Razorpay's hosted Checkout modal collects payment (card/UPI/netbanking).
5. On success, Razorpay returns a signed payload to the frontend, which is sent to `POST /api/v1/payment/verify`.
6. Backend verifies the HMAC signature server-side (never trusts the client), and only then marks the order as `paid` and stores the transaction ID.

This ensures payment confirmation can never be spoofed from the client — the order is only marked paid after a cryptographic signature check on the server.

**Authentication flow:**

- Register/login handled via **Supabase Auth**.
- On successful login, the backend returns a JWT `access_token`, which the frontend stores in a cookie (`js-cookie`) and attaches as a `Bearer` token on every authenticated request.
- Backend middleware (`auth.middleware.js`) verifies the JWT via Supabase on protected routes; `adminOnly.js` further restricts admin-only routes based on the user's role in the `profiles` table.

---

## Tech Stack Decisions & Tradeoffs

| Layer | Choice | Reasoning |
|---|---|---|
| Frontend | Next.js (App Router) + Tailwind CSS | Required by the assignment. App Router gives file-based routing, good defaults for a small team, and fast iteration. |
| Backend | Node.js + Express | **Explicitly discouraged in favor of Python/Go, chosen anyway** — see justification below. |
| Database | Supabase Postgres | Relational, satisfies the "PostgreSQL preferred" requirement, and pairs naturally with Supabase Auth for a faster, more reliable auth implementation under a tight deadline. |
| Auth | Supabase Auth (JWT-based) | Avoids hand-rolling password hashing, token issuance, and email verification — reduces attack surface compared to a fully custom auth system built in 2 days. |
| Payment | Razorpay (test mode) | Stripe requires an invite to create a new India-based account (confirmed as of July 2026); Razorpay test-mode keys are available immediately without KYC, per Razorpay's own documentation. |

### Why Node.js over Python/Go (despite being discouraged)

The assignment recommends Python (FastAPI/Django) or Go (Gin/Fiber) and explicitly discourages Node.js. Node was chosen due to:

- Strongest personal familiarity with Express and its ecosystem, which mattered given the 2-day deadline.
- A single-language stack (JavaScript/TypeScript-adjacent) across frontend and backend reduces context-switching overhead during rapid development.
- Express's middleware model made it straightforward to implement the required modular structure (separated routes/controllers/validation/middleware) without a steep learning curve mid-assignment.

**Tradeoff acknowledged:** Python (FastAPI) or Go would likely offer better raw throughput and stricter typing out of the box (FastAPI's Pydantic validation, Go's static typing). Given more time, a FastAPI rewrite would be the first candidate for a "production-grade" iteration, since the assignment explicitly prefers it.

### Why Supabase Auth over fully custom JWT

Building a secure custom auth system (password hashing, refresh token rotation, email verification, rate limiting on login) from scratch in 2 days carries real security risk. Supabase Auth handles this by a team specializing in it, letting effort focus on the actual e-commerce logic (orders, payments, admin panel) instead.

**Tradeoff:** less control over the exact auth flow, and a dependency on a third-party service being available.

### Why Row-Level Security (RLS) is disabled

RLS was intentionally left off on the Supabase tables. Instead, **all access control is enforced at the API layer** (Express middleware checks the authenticated user's ID/role before allowing reads/writes). This was a deliberate, documented choice — not an oversight — for two reasons:

1. The backend is the only client that talks to the database (the frontend never queries Supabase directly), so the API layer is a complete and sufficient enforcement boundary.
2. Debugging RLS policies under a 2-day deadline carries a real risk of accidentally locking out legitimate requests or, worse, leaving a policy gap that's harder to catch than an application-layer bug.

**Tradeoff acknowledged:** RLS is considered defense-in-depth in production Supabase apps. If the database were ever queried directly (e.g., a future admin dashboard hitting Supabase directly), this would need to be revisited and RLS enabled as a second layer of protection.

### Why product images are external URLs, not Supabase Storage

Products store a plain `image_url` string rather than an uploaded file in Supabase Storage. This was a conscious time tradeoff — Storage integration (upload UI, bucket policies, signed URLs) was deprioritized in favor of finishing the core order/payment flow, which carries more weight in the evaluation criteria.

**Tradeoff acknowledged:** this means product images depend on external hosting staying available, and there's no image upload UI in the admin panel — only a URL field.

### Why Razorpay instead of Stripe

Stripe was the original choice, but new India-based Stripe accounts require an invite as of mid-2026 with no self-serve signup path. Razorpay was adopted instead: its test-mode API keys are issued immediately after signup with no KYC/PAN requirement (KYC is only required to activate **live** payments), which matched the 2-day timeline.

---

## Setup & Local Run Instructions

### Prerequisites

- Node.js v18+
- A Supabase project (free tier is enough)
- A Razorpay account (test mode)

### 1. Clone the repo

```bash
git clone https://github.com/DIPAL1209/QuickCart-Product.git
cd QuickCart-Product
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```dotenv
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_own_random_secret_string
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
```

Run the database schema SQL (see `/backend/sql` if included, or run manually in Supabase's SQL Editor) to create the `profiles`, `categories`, `products`, `orders`, and `order_items` tables.

Start the backend:

```bash
npm start
```

Backend runs on `http://localhost:5000`.

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.

### 4. Create an admin user

Register a normal account through the app, then in Supabase's Table Editor, manually set that user's `role` column (in the `profiles` table) to `admin`.

---

## Feature List

**Customer Storefront**
- Register / login (Supabase Auth, secure password handling)
- Browse products with category filter and search
- Product detail page with stock display
- Add to cart, adjust quantity (+/-), persistent cart via `localStorage`
- "Added to Cart" confirmation toast with a "View Cart" shortcut
- Checkout with order summary and real Razorpay payment (Cards, UPI, Netbanking, test mode)
- Signature-verified payment confirmation (server-side, not client-trusted)
- Order history with itemized past orders

**Admin Panel**
- Secure admin-only routes (role-checked middleware)
- Dashboard: total sales, total paid orders, top 5 products
- Product management: create, edit, soft-delete (hides from store without breaking historical order records)
- Inline "+ New Category" creation from the product form
- Order management: view all orders, update order status
- Confirmation modal on destructive actions (no native browser `confirm()` dialogs)

**Backend**
- RESTful, versioned API (`/api/v1/...`)
- JWT-based authentication & role-based authorization
- Centralized error handling middleware
- Input validation on all write endpoints (zod schemas)
- Stock validation and atomic deduction on order creation

---

## Known Limitations

- **No refresh-token auto-renewal.** The frontend stores only the short-lived Supabase `access_token`. When it expires (~1 hour), the user must log in again — there's no silent refresh-token flow wired up yet. This is a known, deliberate deprioritization to focus time on the core order/payment flow.
- **Product images are external URLs**, not uploaded/stored in Supabase Storage. No image-upload UI exists in the admin panel.
- **Row-Level Security is disabled** on Supabase tables; all access control is enforced in the Express API layer instead (see reasoning above).
- **CSV bulk product upload and role-based access (Admin vs Manager)** — listed as optional bonus features in the assignment — were not implemented due to the 2-day time constraint.
- **No automated tests** (unit/integration) were written, given the deadline; testing was done manually end-to-end.

---

## Future Improvements

- Implement silent refresh-token renewal so users aren't logged out mid-session.
- Add Supabase Storage-based image uploads for products (replacing plain URL input).
- Enable Row-Level Security as a defense-in-depth layer alongside API-level checks.
- Add CSV bulk product upload and a Manager role with restricted admin permissions.
- Add automated tests (Jest/Supertest for backend, React Testing Library for frontend).
- Add pagination and server-side search/filtering for the product list as the catalog grows.

---

## Demo Credentials & Test Payment

**Admin demo account:**
- Email: `[add a clean demo admin email you create for the evaluator]`
- Password: `[add password]`

**Customer demo account (optional):**
- Email: `[add if provided]`
- Password: `[add if provided]`

**Test payment (Razorpay test mode):**
- Card: `4111 1111 1111 1111`, any future expiry, any 3-digit CVV
- UPI: enter `success@razorpay` as the UPI ID to simulate an instant successful payment

No real money is charged — this is Razorpay's test/sandbox environment.
