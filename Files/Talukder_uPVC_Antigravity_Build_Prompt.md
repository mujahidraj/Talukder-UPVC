# Antigravity Build Prompt — Talukder uPVC Website \& Admin Panel



## 0\. How to work

1. Read `Talukder\_uPVC\_Website\_SRS.docx` in full before writing any code.
It is the source of truth for every feature, field, role, and
non-functional requirement. This prompt adds design direction, extra
polish sections, and performance requirements on top of it — it does
not replace anything in the SRS.
2. Read `Talukder\_uPVC\_Product\_Catalog.xlsx` and treat its 18 columns as
the mandatory baseline schema for the Product entity (SRS Section 5).
Do not drop or rename a column without telling me.
3. Before writing code, produce a short build plan: monorepo layout,
Prisma schema draft, and page/route list. Show it to me before
scaffolding, so I can catch anything wrong early.
4. **Never invent or hardcode secrets, API keys, or connection strings.**
Wherever a secret is needed, add it to `.env.example` with a clear
name and comment, and explicitly ask me for the real value before
assuming a default. Do not proceed past a step that needs a secret
you don't have — pause and ask.
5. Work in small, reviewable increments: scaffold → data layer → API →
admin panel → public site → polish/performance pass. Confirm each
phase works (build passes, seed data loads, key pages render) before
moving to the next.

\---

## 1\. Tech stack (fixed — do not substitute)

**No external managed services.** Everything below must run entirely on
one server/VPS with nothing but Postgres as a supporting service — no
Redis, no message broker, no cloud object storage, no third-party search
service. Background work and file storage are handled inside the NestJS
app itself, as described below.

**Frontend**

* Plain **React** via **Vite** (NOT Next.js) — client-rendered SPA.
* **React Router** for routing.
* **TanStack Query** for server-state caching/fetching.
* **Zustand** for client state (Wishlist + Enquiry-list, cart-like local
state before submission).
* **Tailwind CSS** for styling.
* **Zod** for form validation schemas, paired with **React Hook Form**.
* **TanStack Table** for the admin's server-side paginated/sortable
product data table.
* **react-helmet-async** to manage per-page `<title>`, meta description,
canonical URL, Open Graph tags, and JSON-LD structured data
client-side (see Section 1a for how this gets baked into static HTML).

**Backend**

* **NestJS** (modular, one module per domain: products, categories,
enquiries, wishlist, admin-users, import, media, cms, reports).
* **Prisma ORM** + **PostgreSQL**.
* **Passport.js + JWT** for admin authentication (access + refresh token
pattern), role guards for Super Admin / Admin-Catalog-Manager /
Sales-Staff.
* **class-validator + class-transformer (DTOs)** for all API request
validation.
* **PostgreSQL full-text search** (`tsvector`/`tsquery`, GIN index) for
global product search — no external search service needed at this
scale (243+ products).
* **Background jobs without Redis/BullMQ:** implement a small
self-contained job runner inside the NestJS app — a Postgres `Job`
table (id, type, status, payload, progress, result, created\_at) plus
a `@nestjs/schedule` cron/interval worker (or a simple in-memory
queue with DB-backed persistence for crash recovery) that polls for
pending jobs and processes them one at a time in the background. Used
for bulk Excel import processing and bulk image resizing so both
report progress to the admin UI (via polling the Job row, or a
Server-Sent Events endpoint) instead of blocking the HTTP request.
This is the whole point of a queue for our scale (hundreds, not
millions, of rows/images) — no external broker needed.
* **Sharp** for image resizing (thumbnail / medium / full sizes),
invoked from the same in-app job runner above.
* **Local disk storage for product images** — store uploaded files
under a persistent volume (e.g. `apps/api/storage/products/`), served
via NestJS's static file serving (`ServeStaticModule` or a dedicated
`/media` controller) with correct cache headers. Structure by product
code/id and image size variant so the folder stays organized as the
catalog grows (e.g. `storage/products/{productCode}/{size}.webp`).
Keep the storage path fully configurable via an env variable so the
client can point it at a mounted volume or move to real object
storage later without changing application code.
* **ExcelJS** for parsing the bulk-import template and generating the
downloadable error report.
* **Nodemailer** for SMTP enquiry notification emails.

**Testing**

* **Jest** for backend unit tests and NestJS e2e tests.
* **Playwright** for frontend end-to-end tests (product browsing,
filtering, search, wishlist, enquiry submission, and the core admin
CRUD + bulk import flows).

**Infra**

* Polyrepo / Multi-repo (Multiple Repositories): Keeps separate, independent projects or microservices in their own individual repositories. like client folder for client side , server folder for server side.  

\---

## 1a. SEO without Next.js (fulfilling SRS Section 6.4)



**Primary approach — React Router v7 Framework Mode static pre-rendering**
React Router v7 has official, built-in static pre-rendering support
(no third-party plugin, actively maintained by the React Router team).
Used in "Framework Mode," it can pre-render a defined list of routes
(or all routes matching a pattern) into real static HTML files at
build time — genuinely equivalent to Next.js's static export, not a
headless-browser hack. Use this as the primary mechanism:

* Pre-render every category, sub-category, and product detail page
(generated from the product/category list at build time, not
hand-listed) plus the homepage and all static/CMS pages.
* Each pre-rendered page includes the real product data, correct
`<title>`/meta description, canonical URL, and `schema.org` Product
JSON-LD (via react-helmet-async, rendered into the static HTML at
build time) — everything SRS 6.4 asks for.
* The compiled app still hydrates into a normal interactive SPA for
real visitors; crawlers and social-share bots see fully-formed HTML
immediately.

**Fallback approach — if the router setup ends up on React Router v6**
Use `vite-react-ssg`, which provides the same build-time static
pre-rendering pattern for v6 projects (same authors describe it as the
"ahead-of-time SSR" approach). Functionally equivalent outcome to the
primary approach above; pick whichever integrates more cleanly with
the rest of the app once routing is scaffolded, and tell me which one
you went with and why.

**Keeping pre-rendered pages fresh (the ISR-equivalent problem)**
Since this is build-time SSG rather than per-request SSR, pages don't
automatically reflect an admin's product edit until the site is
rebuilt. Solve this the same way many SSG sites do: have the admin
panel's "publish" / bulk-import-completion actions trigger a rebuild +
re-prerender step (a simple deploy webhook or a scheduled rebuild,
e.g. every 15–30 minutes, is enough at this catalog's size — you are
not rebuilding thousands of pages, only hundreds). Tell me your
hosting target and I'll make this concrete rather than leaving it
abstract.

**Supporting pieces (needed regardless of which pre-render tool is used)**

* **Dynamic `sitemap.xml` and `robots.txt`** generated from the live
database (a small script or a NestJS endpoint that queries products/
categories and emits the sitemap), not a hand-maintained static file
— this must grow automatically as products are added.
* **JSON-LD structured data** (`schema.org/Product`, omitting price/
offer fields per SRS 2.4's no-checkout constraint) injected per
product page via react-helmet-async and captured in the pre-rendered
HTML.
* **Canonical URLs** on every pre-rendered page to prevent duplicate-
content issues from filter/sort query parameters on listing pages.
* **Open Graph + Twitter Card meta tags** per page so links shared on
WhatsApp/Facebook (a very likely sharing channel for a B2B buyer in
this market) render a proper preview card instead of a blank one.

Flag to me during the build plan (Section 0, step 3) which specific
pages, if any, can't be cleanly pre-rendered, so we can decide on a
fallback together rather than silently shipping a blank-shell page for
that route.

\---

## 2\. Design direction — this is a first-impression-critical site

The client's instruction: **UX matters most.** A visitor who lands on a
slow or ugly page will not come back, regardless of how good the catalog
is underneath. Build accordingly:

**Visual style**

* Light theme throughout, clean and industrial-professional — this is a
B2B manufacturing catalog (pipes, fittings, construction materials),
not a lifestyle brand. Think: generous white space, a confident
primary color (suggest a blue or teal that reads as "engineering /
trust / water" — propose 2–3 palette options with hex values and let
me pick), strong typographic hierarchy, high-quality product imagery
as the hero of every page.
* Data-rich but not cluttered: this catalog has real technical depth
(18 fields per product, spec tables, standards like BS-3505). Design
the product detail page and comparison view so density reads as
"trustworthy technical reference," not "spreadsheet dumped on a page."
Use spec tables, icon-labeled attributes, and progressive disclosure
(collapsible sections) rather than walls of text.
* Consistent design tokens (spacing scale, type scale, color scale) set
up once in Tailwind config, not ad-hoc per component.

**Performance / perceived speed (non-negotiable)**

* Use the build-time prerendering described in Section 1 so the
home/category/product pages arrive with real HTML already painted,
not a blank shell waiting on a client fetch. React then hydrates on
top for interactivity — this is the closest a Vite SPA gets to
Next.js's SSG without adopting a full framework.
* Every product/category image is served pre-resized (thumbnail,
medium, full — generated by the local image job runner) and loaded
with native `loading="lazy"`, explicit `width`/`height` to prevent
layout shift, and a lightweight blur/placeholder technique (e.g. a
tiny inline base64 preview) — never an unsized, full-resolution
`<img>`.
* Route-level code splitting via `React.lazy` + `Suspense`; heavy
admin-only libraries (TanStack Table, rich-text editor, chart
library) must live in an admin-only bundle, never shipped to public
site visitors.
* Skeleton loading states for anything genuinely client-fetched (live
wishlist count, search-as-you-type results, any data not covered by
prerendering) — never a blank flash while data loads.
* Target Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms on a
throttled 4G profile. Treat this as a build acceptance criterion, not
an afterthought — run a Lighthouse pass before calling any phase done.
* Self-host fonts (download and serve from `/public/fonts`, preload the
critical weight) rather than a render-blocking Google Fonts request,
to avoid FOUT/FOIT.

\---

## 3\. Sections to ADD beyond the SRS (professional polish)

The SRS covers full functional scope. Add these presentation-layer
sections/components to make the site feel like a mature, established
manufacturer rather than a bare catalog:

* **Trust bar** near the top of the homepage: certifications/standards
(BS-3505), years in business, "100% virgin material" quality claim
(pulled straight from the catalog's Features field), manufacturing
capacity — short, scannable trust signals, not paragraphs.
* **"Why Talukder uPVC" section** — 3–4 value props with icons (quality
standard, manufacturing process, nationwide distribution, after-sales
support) on the homepage.
* **Manufacturing / Factory gallery page** — photos of the production
line, auto-belling machines, QC process (referenced in the catalog's
Features text) if the client can supply images; otherwise stub with
clear placeholder instructions for the client.
* **Dealer / Distributor locator** (if applicable) — static list or map
pins by district, tied to SRS Section 3.9's "branch/dealer locator."
* **Downloadable resources section** — full catalog PDF (SRS 3.9),
per-product spec sheet PDF (SRS 3.4), and a BS-3505 standard summary
one-pager.
* **FAQ section** — sizing/thickness/class explainer for non-technical
buyers, delivery/enquiry process explainer (since there's no
checkout, buyers need to understand how ordering actually works).
* **Testimonials / client logos strip** (optional, stub with placeholder
content and a comment for the client to supply real ones).
* **Footer mega-footer**: full category tree, certifications, contact,
social links, newsletter/enquiry-list signup — this is also good for
SEO internal linking across 11 categories.
* **404 and empty-search states** designed on-brand, not default
framework pages — SRS 3.5 already asks for a "no results" state with
suggested categories; extend that same care to the 404 page.

\---

## 4\. Deliverable expectations

* Admin panel fully functional per SRS Section 4 (auth, dashboard,
product CRUD, bulk Excel import with preview/validation, bulk image
upload with filename-matching, category management, enquiry
management, CMS, reports, activity log).
* Public site fully functional per SRS Section 3, styled per Section 2
of this prompt, plus the added sections in Section 3 above.
* README with setup steps, environment variable list (see below),
and how to run tests (`jest` + `playwright`).
* Ask me for any missing information (brand colors if I don't pick from
your proposed palette, logo file, real testimonial/dealer content,
production images) rather than inventing placeholder brand assets and
presenting them as final.

\---

## 5\. Environment variables Antigravity should ask me for

Instruct Antigravity, as part of its own setup flow, to explicitly ask
me for the values below rather than guessing or leaving them blank in a
committed file. Suggested `.env` shape:

**Database**

* `DATABASE\_URL` — DATABASE\_URL=postgresql://postgres:1234@localhost:5432/talukder-upvc-new
`SHADOW\_DATABASE\_URL` — for Prisma Migrate (if using a managed DB that
needs a separate shadow DB)

**Auth**

* `JWT\_ACCESS\_SECRET`
* `JWT\_REFRESH\_SECRET`
* `JWT\_ACCESS\_EXPIRES\_IN` (e.g. `15m`)
* `JWT\_REFRESH\_EXPIRES\_IN` (e.g. `7d`)

**File Storage (local)**

* UPLOAD\_DRIVER=local
* UPLOAD\_LOCAL\_PATH=./uploads

**Email (enquiry notifications, SRS 2.5 / 3.7)**

* `SMTP\_HOST`
* `SMTP\_PORT`
* `SMTP\_USER`
* `SMTP\_PASSWORD`
* `SMTP\_FROM\_ADDRESS`
* `SALES\_TEAM\_NOTIFICATION\_EMAIL`

**Spam protection (SRS 3.7, optional CAPTCHA)**

* `RECAPTCHA\_SITE\_KEY`
* `RECAPTCHA\_SECRET\_KEY`

**Frontend** (Vite exposes only vars prefixed `VITE\_` to client code)

* `VITE\_API\_URL`
* `VITE\_SITE\_URL` (for canonical URLs, sitemap, structured data, and the
prerender script's base URL)
* `VITE\_RECAPTCHA\_SITE\_KEY`

**Optional / future (SMS/WhatsApp, SRS 2.5)**

* `SMS\_PROVIDER\_API\_KEY` (only if phased in — SRS marks this optional)
* `WHATSAPP\_BUSINESS\_API\_TOKEN` (only if phased in)

**Rate Limiting**

* RATE\_LIMIT\_WINDOW\_MS=600000
* RATE\_LIMIT\_MAX=500

**Admin seed**

* `SUPER\_ADMIN\_EMAIL : admin@talukder-upvc.com` / `SUPER\_ADMIN\_PASSWORD : Admin@123456` — for the initial seeded
Super Admin account (should be forced to change password on first
login, never left as a static default in production)

