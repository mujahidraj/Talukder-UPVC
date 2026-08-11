# Talukder uPVC Website & Admin Panel — Build Plan

## Overview

Build a complete B2B product catalog website + admin panel for Talukder uPVC Fittings Industries Ltd. The system presents 243 uPVC products across 11 categories in an e-commerce-style browsing experience **without** any payment/checkout — conversion happens via Enquiry/Quote Request forms.

---

## Color Palette Options

> [!IMPORTANT]
> **Please pick one of these 3 palettes** (or tell me your preference). Each is designed for a B2B manufacturing catalog — conveying trust, engineering precision, and water/pipe associations.

### Option A — "Engineering Teal" (Recommended)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#0A7E8C` | Buttons, links, nav highlights |
| Primary Dark | `#065A63` | Hover states, headings |
| Primary Light | `#E0F4F5` | Backgrounds, badges |
| Accent | `#F59E0B` | CTAs, "Add to Enquiry", trust bar icons |
| Neutral 900 | `#111827` | Body text |
| Neutral 100 | `#F3F4F6` | Section backgrounds |
| Surface | `#FFFFFF` | Cards, panels |
| Success | `#10B981` | Active status |
| Warning | `#F59E0B` | Upcoming badge |
| Danger | `#EF4444` | Errors, delete |

### Option B — "Industrial Blue"
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#1E56A0` | Main brand color |
| Primary Dark | `#163C72` | Hover/headings |
| Primary Light | `#E8F0FE` | Backgrounds |
| Accent | `#D97706` | CTAs |

### Option C — "Deep Ocean"
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#0077B6` | Main brand color |
| Primary Dark | `#023E8A` | Hover/headings |
| Primary Light | `#CAF0F8` | Backgrounds |
| Accent | `#E76F51` | CTAs |

---

## Project Structure (Polyrepo Layout)

Two independent folders at the workspace root — **not** a monorepo. Each has its own `package.json`, scripts, and dependencies.

```
UPVC Site/
├── client/                          # Vite + React SPA
│   ├── public/
│   │   ├── fonts/                   # Self-hosted Inter font files
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── src/
│   │   ├── main.tsx                 # Entry point
│   │   ├── App.tsx                  # Router setup
│   │   ├── api/                     # Axios instance + API hooks (TanStack Query)
│   │   │   ├── client.ts            # Axios instance with interceptors
│   │   │   ├── products.ts          # useProducts, useProduct, useProductSearch
│   │   │   ├── categories.ts        # useCategories, useCategoryTree
│   │   │   ├── enquiries.ts         # useSubmitEnquiry, useMyEnquiries
│   │   │   ├── wishlist.ts          # useWishlistSync (optional registered user)
│   │   │   ├── cms.ts               # useBanners, usePage, useFAQ
│   │   │   ├── admin/               # Admin-specific API hooks
│   │   │   │   ├── products.ts
│   │   │   │   ├── categories.ts
│   │   │   │   ├── enquiries.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── import.ts
│   │   │   │   ├── media.ts
│   │   │   │   ├── cms.ts
│   │   │   │   ├── reports.ts
│   │   │   │   └── activity-log.ts
│   │   │   └── auth.ts              # useLogin, useRefresh, useLogout
│   │   ├── store/                   # Zustand stores
│   │   │   ├── wishlist.ts          # Wishlist (localStorage-backed)
│   │   │   ├── enquiry-list.ts      # Enquiry/cart list (localStorage-backed)
│   │   │   └── auth.ts              # Admin auth state (tokens)
│   │   ├── components/
│   │   │   ├── ui/                  # Design system primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── Breadcrumb.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   ├── layout/
│   │   │   │   ├── PublicLayout.tsx  # Navbar + MegaMenu + Footer
│   │   │   │   ├── AdminLayout.tsx  # Sidebar + Header
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── MegaMenu.tsx     # 3-level category navigation
│   │   │   │   ├── Footer.tsx       # Mega-footer with full category tree
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   └── AdminHeader.tsx
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── ProductListItem.tsx
│   │   │   │   ├── FilterSidebar.tsx
│   │   │   │   ├── SortDropdown.tsx
│   │   │   │   ├── ImageGallery.tsx
│   │   │   │   ├── SpecTable.tsx
│   │   │   │   ├── ComparisonTable.tsx
│   │   │   │   └── RelatedProducts.tsx
│   │   │   ├── enquiry/
│   │   │   │   ├── EnquiryListDrawer.tsx
│   │   │   │   ├── EnquiryForm.tsx
│   │   │   │   └── QuickEnquiryModal.tsx
│   │   │   ├── wishlist/
│   │   │   │   └── WishlistDrawer.tsx
│   │   │   ├── home/
│   │   │   │   ├── HeroBanner.tsx
│   │   │   │   ├── TrustBar.tsx
│   │   │   │   ├── CategoryGrid.tsx
│   │   │   │   ├── FeaturedProducts.tsx
│   │   │   │   ├── WhyTalukder.tsx
│   │   │   │   └── TestimonialStrip.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── AutoSuggest.tsx
│   │   │   └── seo/
│   │   │       ├── SEOHead.tsx       # react-helmet-async wrapper
│   │   │       └── JsonLd.tsx        # schema.org Product/Organization
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── CategoryPage.tsx
│   │   │   │   ├── SubCategoryPage.tsx
│   │   │   │   ├── ProductListPage.tsx
│   │   │   │   ├── ProductDetailPage.tsx
│   │   │   │   ├── SearchResultsPage.tsx
│   │   │   │   ├── WishlistPage.tsx
│   │   │   │   ├── EnquiryPage.tsx       # Cart-like enquiry list + form
│   │   │   │   ├── EnquiryConfirmation.tsx
│   │   │   │   ├── ComparePage.tsx
│   │   │   │   ├── AboutPage.tsx
│   │   │   │   ├── ContactPage.tsx
│   │   │   │   ├── CertificationsPage.tsx
│   │   │   │   ├── FactoryGalleryPage.tsx
│   │   │   │   ├── FAQPage.tsx
│   │   │   │   ├── DownloadsPage.tsx
│   │   │   │   ├── PrivacyPage.tsx
│   │   │   │   ├── TermsPage.tsx
│   │   │   │   └── NotFoundPage.tsx     # Branded 404
│   │   │   └── admin/
│   │   │       ├── LoginPage.tsx
│   │   │       ├── DashboardPage.tsx
│   │   │       ├── ProductsPage.tsx     # TanStack Table with server pagination
│   │   │       ├── ProductFormPage.tsx  # Create/Edit form (all 18 fields)
│   │   │       ├── BulkImportPage.tsx   # Upload + preview + confirm
│   │   │       ├── MediaLibraryPage.tsx # Image management
│   │   │       ├── CategoriesPage.tsx   # Tree editor
│   │   │       ├── EnquiriesPage.tsx    # List + detail + status workflow
│   │   │       ├── EnquiryDetailPage.tsx
│   │   │       ├── UsersPage.tsx        # Admin user management
│   │   │       ├── CMSPage.tsx          # Banners, pages, featured products
│   │   │       ├── ReportsPage.tsx
│   │   │       ├── ActivityLogPage.tsx
│   │   │       └── SettingsPage.tsx
│   │   ├── hooks/                    # Shared custom hooks
│   │   │   ├── useDebounce.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   └── useIntersectionObserver.ts
│   │   ├── lib/
│   │   │   ├── utils.ts              # Slug generation, formatting helpers
│   │   │   └── constants.ts
│   │   ├── schemas/                  # Zod validation schemas
│   │   │   ├── enquiry.ts
│   │   │   ├── product.ts
│   │   │   └── auth.ts
│   │   └── types/                    # Shared TypeScript types
│   │       ├── product.ts
│   │       ├── category.ts
│   │       ├── enquiry.ts
│   │       └── api.ts
│   ├── index.html
│   ├── tailwind.config.ts            # Design tokens, spacing, colors
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── server/                           # NestJS Backend
│   ├── src/
│   │   ├── main.ts                   # Bootstrap, CORS, validation pipe
│   │   ├── app.module.ts
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   ├── prisma.service.ts
│   │   │   └── schema.prisma         # Full Prisma schema
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/       # JWT, Local strategies
│   │   │   │   ├── guards/           # JwtAuthGuard, RolesGuard
│   │   │   │   ├── decorators/       # @Roles(), @CurrentUser()
│   │   │   │   └── dto/
│   │   │   ├── products/
│   │   │   │   ├── products.module.ts
│   │   │   │   ├── products.controller.ts     # Public endpoints
│   │   │   │   ├── products-admin.controller.ts # Admin CRUD
│   │   │   │   ├── products.service.ts
│   │   │   │   └── dto/
│   │   │   ├── categories/
│   │   │   │   ├── categories.module.ts
│   │   │   │   ├── categories.controller.ts
│   │   │   │   ├── categories-admin.controller.ts
│   │   │   │   ├── categories.service.ts
│   │   │   │   └── dto/
│   │   │   ├── enquiries/
│   │   │   │   ├── enquiries.module.ts
│   │   │   │   ├── enquiries.controller.ts      # Public submit
│   │   │   │   ├── enquiries-admin.controller.ts # Admin management
│   │   │   │   ├── enquiries.service.ts
│   │   │   │   └── dto/
│   │   │   ├── wishlist/
│   │   │   │   ├── wishlist.module.ts
│   │   │   │   ├── wishlist.controller.ts
│   │   │   │   ├── wishlist.service.ts
│   │   │   │   └── dto/
│   │   │   ├── import/
│   │   │   │   ├── import.module.ts
│   │   │   │   ├── import.controller.ts    # Upload, preview, confirm
│   │   │   │   ├── import.service.ts       # Excel parsing + validation
│   │   │   │   └── dto/
│   │   │   ├── media/
│   │   │   │   ├── media.module.ts
│   │   │   │   ├── media.controller.ts     # Upload, serve, bulk upload
│   │   │   │   ├── media.service.ts        # Sharp resizing, file storage
│   │   │   │   └── dto/
│   │   │   ├── cms/
│   │   │   │   ├── cms.module.ts
│   │   │   │   ├── cms.controller.ts
│   │   │   │   ├── cms.service.ts
│   │   │   │   └── dto/
│   │   │   ├── admin-users/
│   │   │   │   ├── admin-users.module.ts
│   │   │   │   ├── admin-users.controller.ts
│   │   │   │   ├── admin-users.service.ts
│   │   │   │   └── dto/
│   │   │   ├── reports/
│   │   │   │   ├── reports.module.ts
│   │   │   │   ├── reports.controller.ts
│   │   │   │   ├── reports.service.ts
│   │   │   │   └── dto/
│   │   │   └── jobs/
│   │   │       ├── jobs.module.ts
│   │   │       ├── jobs.service.ts         # DB-backed job queue
│   │   │       ├── job-runner.service.ts   # @nestjs/schedule cron worker
│   │   │       └── processors/
│   │   │           ├── import.processor.ts
│   │   │           └── image-resize.processor.ts
│   │   ├── common/
│   │   │   ├── filters/              # HttpException filter
│   │   │   ├── interceptors/         # Logging, transform
│   │   │   ├── pipes/                # Validation pipe
│   │   │   └── decorators/
│   │   └── config/
│   │       ├── app.config.ts         # Validated env config
│   │       └── mail.config.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts                   # Seed categories, products, super admin
│   ├── storage/                      # Local file storage (gitignored)
│   │   └── products/
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env.example
│
├── Files/                            # Source files (existing)
│   ├── Talukder_uPVC_Product_Catalog.xlsx
│   ├── Talukder_uPVC_Website_SRS.docx
│   └── Product Image/
└── README.md
```

---

## Prisma Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Categories (3-level tree) ───────────────────────────
model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  image       String?
  icon        String?
  parentId    String?    @map("parent_id")
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  level       Int        @default(0)  // 0=main, 1=sub, 2=sub-sub
  sortOrder   Int        @default(0)  @map("sort_order")
  isVisible   Boolean    @default(true) @map("is_visible")
  metaTitle       String? @map("meta_title")
  metaDescription String? @map("meta_description")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  products    Product[]

  @@map("categories")
}

// ─── Product (18 catalog columns + system fields) ────────
model Product {
  id                    String          @id @default(cuid())
  productCode           String          @unique @map("product_code")
  productName           String          @map("product_name")
  slug                  String          @unique
  categoryId            String          @map("category_id")
  category              Category        @relation(fields: [categoryId], references: [id])
  fittingConnectionType String?         @map("fitting_connection_type")
  size                  String
  thicknessMm           String?         @map("thickness_mm")
  length                String?
  color                 String?
  classType             String?         @map("class_type")
  material              String?
  brandManufacturer     String?         @map("brand_manufacturer")
  description           String?         @db.Text
  features              String[]        // Parsed from semicolon-delimited
  applications          String[]        // Parsed from semicolon-delimited
  status                ProductStatus   @default(ACTIVE)
  sourcePageCatalog     String?         @map("source_page_catalog")
  metaTitle             String?         @map("meta_title")
  metaDescription       String?         @map("meta_description")
  viewCount             Int             @default(0) @map("view_count")
  wishlistCount         Int             @default(0) @map("wishlist_count")
  enquiryCount          Int             @default(0) @map("enquiry_count")
  isFeatured            Boolean         @default(false) @map("is_featured")
  isDeleted             Boolean         @default(false) @map("is_deleted")
  createdById           String?         @map("created_by_id")
  createdBy             AdminUser?      @relation("ProductCreatedBy", fields: [createdById], references: [id])
  lastModifiedById      String?         @map("last_modified_by_id")
  lastModifiedBy        AdminUser?      @relation("ProductModifiedBy", fields: [lastModifiedById], references: [id])
  createdAt             DateTime        @default(now()) @map("created_at")
  updatedAt             DateTime        @updatedAt @map("updated_at")

  images          ProductImage[]
  enquiryItems    EnquiryItem[]
  wishlistItems   WishlistItem[]

  // Full-text search vector (managed via raw SQL migration)
  // searchVector    Unsupported("tsvector")?

  @@index([categoryId])
  @@index([status])
  @@index([productCode])
  @@map("products")
}

enum ProductStatus {
  ACTIVE
  UPCOMING
  INACTIVE
  DISCONTINUED
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String   @map("product_id")
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  fileName  String   @map("file_name")
  filePath  String   @map("file_path")       // Relative path in storage
  thumbPath String?  @map("thumb_path")
  mediumPath String? @map("medium_path")
  fullPath  String   @map("full_path")
  blurHash  String?  @map("blur_hash")       // Tiny base64 placeholder
  altText   String?  @map("alt_text")
  sortOrder Int      @default(0) @map("sort_order")
  isPrimary Boolean  @default(false) @map("is_primary")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([productId])
  @@map("product_images")
}

// ─── Admin Users & Roles ─────────────────────────────────
model AdminUser {
  id                String    @id @default(cuid())
  name              String
  email             String    @unique
  passwordHash      String    @map("password_hash")
  role              AdminRole @default(CATALOG_MANAGER)
  isActive          Boolean   @default(true) @map("is_active")
  mustChangePassword Boolean  @default(true) @map("must_change_password")
  lastLoginAt       DateTime? @map("last_login_at")
  failedLoginAttempts Int     @default(0) @map("failed_login_attempts")
  lockedUntil       DateTime? @map("locked_until")
  refreshToken      String?   @map("refresh_token")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  productsCreated   Product[] @relation("ProductCreatedBy")
  productsModified  Product[] @relation("ProductModifiedBy")
  importJobs        ImportJob[]
  activityLogs      ActivityLog[]
  assignedEnquiries Enquiry[] @relation("AssignedEnquiries")

  @@map("admin_users")
}

enum AdminRole {
  SUPER_ADMIN
  CATALOG_MANAGER
  SALES_STAFF
}

// ─── Enquiry (RFQ) System ────────────────────────────────
model Enquiry {
  id              String        @id @default(cuid())
  // Customer info (no registration required)
  customerName    String        @map("customer_name")
  companyName     String?       @map("company_name")
  email           String
  phone           String
  address         String?
  district        String?
  deliveryPref    String?       @map("delivery_preference")
  message         String?       @db.Text
  status          EnquiryStatus @default(NEW)
  assignedToId    String?       @map("assigned_to_id")
  assignedTo      AdminUser?    @relation("AssignedEnquiries", fields: [assignedToId], references: [id])
  internalNotes   String?       @map("internal_notes") @db.Text
  sourcePage      String?       @map("source_page")  // Which page the enquiry came from
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  items           EnquiryItem[]

  @@index([status])
  @@index([createdAt])
  @@map("enquiries")
}

enum EnquiryStatus {
  NEW
  IN_PROGRESS
  QUOTED
  WON
  CLOSED
  LOST
}

model EnquiryItem {
  id        String  @id @default(cuid())
  enquiryId String  @map("enquiry_id")
  enquiry   Enquiry @relation(fields: [enquiryId], references: [id], onDelete: Cascade)
  productId String  @map("product_id")
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int     @default(1)
  note      String?
  
  @@index([enquiryId])
  @@map("enquiry_items")
}

// ─── Wishlist ────────────────────────────────────────────
model WishlistItem {
  id        String   @id @default(cuid())
  sessionId String?  @map("session_id")  // For guest users
  productId String   @map("product_id")
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([sessionId, productId])
  @@index([productId])
  @@map("wishlist_items")
}

// ─── Import Jobs (DB-backed queue) ───────────────────────
model ImportJob {
  id          String      @id @default(cuid())
  type        JobType
  status      JobStatus   @default(PENDING)
  fileName    String?     @map("file_name")
  importMode  String?     @map("import_mode")  // insert, update, upsert
  payload     Json?       // Any additional config
  progress    Int         @default(0)  // 0-100
  rowsTotal   Int         @default(0)  @map("rows_total")
  rowsSuccess Int         @default(0)  @map("rows_success")
  rowsFailed  Int         @default(0)  @map("rows_failed")
  result      Json?       // Summary, error details
  errorReportPath String? @map("error_report_path")
  uploadedById    String  @map("uploaded_by_id")
  uploadedBy      AdminUser @relation(fields: [uploadedById], references: [id])
  startedAt   DateTime?   @map("started_at")
  completedAt DateTime?   @map("completed_at")
  createdAt   DateTime    @default(now()) @map("created_at")

  @@index([status])
  @@map("import_jobs")
}

enum JobType {
  EXCEL_IMPORT
  BULK_IMAGE_RESIZE
  REPORT_EXPORT
}

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

// ─── CMS ─────────────────────────────────────────────────
model Banner {
  id        String   @id @default(cuid())
  title     String
  subtitle  String?
  imageUrl  String   @map("image_url")
  linkUrl   String?  @map("link_url")
  sortOrder Int      @default(0) @map("sort_order")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("banners")
}

model Page {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  content         String   @db.Text
  metaTitle       String?  @map("meta_title")
  metaDescription String?  @map("meta_description")
  isPublished     Boolean  @default(true) @map("is_published")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("pages")
}

model FAQ {
  id        String   @id @default(cuid())
  question  String
  answer    String   @db.Text
  sortOrder Int      @default(0) @map("sort_order")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("faqs")
}

// ─── Activity Log (Audit Trail) ──────────────────────────
model ActivityLog {
  id         String   @id @default(cuid())
  actorId    String   @map("actor_id")
  actor      AdminUser @relation(fields: [actorId], references: [id])
  action     String   // CREATE, UPDATE, DELETE, LOGIN, IMPORT, etc.
  entity     String   // Product, Category, Enquiry, etc.
  entityId   String?  @map("entity_id")
  before     Json?    // Snapshot before change
  after      Json?    // Snapshot after change
  ipAddress  String?  @map("ip_address")
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([entity, entityId])
  @@index([actorId])
  @@index([createdAt])
  @@map("activity_logs")
}
```

---

## Routes / Pages

### Public Website Routes

| Route | Page | Pre-renderable? | Notes |
|-------|------|:---:|-------|
| `/` | HomePage | ✅ | Hero, trust bar, categories, featured products |
| `/categories/:slug` | CategoryPage | ✅ | Shows sub-categories for a main category |
| `/categories/:slug/:subSlug` | SubCategoryPage | ✅ | Shows sub-sub-categories or product list |
| `/products` | ProductListPage | ✅ (base) | Full catalog with filters, sort, search |
| `/products/:slug` | ProductDetailPage | ✅ | Full 18-field spec, gallery, related |
| `/search` | SearchResultsPage | ❌ | Dynamic, needs client-side fetch |
| `/compare` | ComparePage | ❌ | Client-side with query params |
| `/wishlist` | WishlistPage | ❌ | Client-side localStorage |
| `/enquiry` | EnquiryPage | ❌ | Cart-like enquiry list + form |
| `/enquiry/confirmation` | EnquiryConfirmation | ❌ | Thank-you page |
| `/about` | AboutPage | ✅ | Company info |
| `/certifications` | CertificationsPage | ✅ | BS-3505, quality standards |
| `/factory` | FactoryGalleryPage | ✅ | Manufacturing photos |
| `/contact` | ContactPage | ✅ | Map, branch locator |
| `/faq` | FAQPage | ✅ | Sizing, ordering process |
| `/downloads` | DownloadsPage | ✅ | Catalog PDF, spec sheets |
| `/privacy` | PrivacyPage | ✅ | Privacy policy |
| `/terms` | TermsPage | ✅ | Terms of use |
| `*` | NotFoundPage | ✅ | Branded 404 |

> [!NOTE]
> `/search`, `/compare`, `/wishlist`, `/enquiry` routes are interactive-only pages that don't benefit from pre-rendering since their content is entirely user-driven. Everything else will be pre-rendered at build time.

### Admin Panel Routes (`/admin/*`)

| Route | Page | Role Required |
|-------|------|--------------|
| `/admin/login` | LoginPage | — |
| `/admin` | DashboardPage | Any admin |
| `/admin/products` | ProductsPage | Catalog Manager+ |
| `/admin/products/new` | ProductFormPage | Catalog Manager+ |
| `/admin/products/:id/edit` | ProductFormPage | Catalog Manager+ |
| `/admin/products/import` | BulkImportPage | Catalog Manager+ |
| `/admin/media` | MediaLibraryPage | Catalog Manager+ |
| `/admin/categories` | CategoriesPage | Catalog Manager+ |
| `/admin/enquiries` | EnquiriesPage | Sales Staff+ |
| `/admin/enquiries/:id` | EnquiryDetailPage | Sales Staff+ |
| `/admin/users` | UsersPage | Super Admin |
| `/admin/cms` | CMSPage | Catalog Manager+ |
| `/admin/reports` | ReportsPage | Catalog Manager+ |
| `/admin/activity-log` | ActivityLogPage | Super Admin |
| `/admin/settings` | SettingsPage | Super Admin |

### API Routes (NestJS)

| Prefix | Public Endpoints | Admin Endpoints |
|--------|-----------------|-----------------|
| `/api/products` | `GET /`, `GET /:slug`, `GET /search` | `POST /`, `PUT /:id`, `DELETE /:id`, `POST /clone/:id` |
| `/api/categories` | `GET /`, `GET /tree`, `GET /:slug` | `POST /`, `PUT /:id`, `DELETE /:id`, `PUT /reorder` |
| `/api/enquiries` | `POST /` (submit) | `GET /`, `GET /:id`, `PUT /:id/status`, `POST /:id/note`, `GET /export` |
| `/api/wishlist` | `POST /track` (anonymous analytics) | `GET /insights` |
| `/api/auth` | — | `POST /login`, `POST /refresh`, `POST /logout`, `POST /change-password` |
| `/api/import` | — | `POST /upload`, `GET /preview/:jobId`, `POST /confirm/:jobId`, `GET /template`, `GET /history` |
| `/api/media` | `GET /products/:code/:size` | `POST /upload`, `POST /bulk-upload`, `GET /library`, `DELETE /:id` |
| `/api/cms` | `GET /banners`, `GET /pages/:slug`, `GET /faqs` | `POST/PUT/DELETE` for each |
| `/api/admin-users` | — | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` (Super Admin only) |
| `/api/reports` | — | `GET /dashboard`, `GET /product-performance`, `GET /enquiry-trends`, `GET /export` |
| `/api/jobs` | — | `GET /:id/status` (polling), `GET /:id/events` (SSE) |
| `/api/activity-log` | — | `GET /` (Super Admin only) |
| `/api/sitemap` | `GET /sitemap.xml` | — |

---

## Category Hierarchy (from catalog data)

The 243 products map into this 3-level tree (will be seeded):

```
Agricultural (5 main categories → mapped to slug)
├── Agricultural Pipe & Fittings
│   └── Buried Pipe (43 products)
Pipes
├── uPVC Pressure Pipe
│   ├── Class B Pipe
│   ├── Class C Pipe
│   ├── Class D Pipe
│   └── Class E Pipe
├── uPVC Pressure Filter Pipe
│   ├── Class B Filter Pipe
│   ├── Class C Filter Pipe
│   ├── Class D Filter Pipe
│   └── Class E Filter Pipe
├── uPVC Sanitation Pipe
│   └── SWR Pipe
├── uPVC Non Pressure Pipe
│   ├── Gold Series Pipe
│   ├── Gold Series Filter Pipe
│   ├── Standard Pipe
│   ├── Sanitary Pipe
│   ├── Uttom Pipe
│   └── Oring Pipe
├── uPVC Plumbing Pipe
│   └── Thread Pipe
└── uPVC Filter Pipe
    └── Small Dia Rib & Robo Filter Pipe
Fittings
├── uPVC SWR Fittings
│   └── SWR Fitting
└── uPVC Fabricated Fittings
    └── Fabricated Fitting
Tubewells
└── Tubewell
    └── Hand Tubewell
Upcoming
└── Upcoming Products
    └── Upcoming
```

---

## Build Phases

### Phase 1: Scaffold & Data Layer
- Initialize `server/` with NestJS CLI
- Initialize `client/` with Vite + React + TypeScript
- Set up Prisma schema, migrations, seed script
- Seed all 243 products + categories from Excel
- Seed Super Admin account
- **Verify:** `prisma migrate dev` runs, seed populates DB, NestJS starts

### Phase 2: Backend API
- Auth module (JWT access/refresh, roles, guards)
- Products module (public browse + admin CRUD)
- Categories module (tree endpoints)
- Full-text search (tsvector migration)
- Media module (Sharp image processing, local storage)
- Import module (ExcelJS parsing, validation, job queue)
- Enquiry module (submit + admin management)
- CMS module (banners, pages, FAQs)
- Reports & Activity Log modules
- **Verify:** All API endpoints work via REST client, tests pass

### Phase 3: Admin Panel
- Login + auth flow (with force password change)
- Dashboard with summary widgets
- Product CRUD with TanStack Table
- Bulk import (upload → preview → confirm flow)
- Media library + bulk image upload
- Category tree management
- Enquiry management with status workflow
- CMS editor (banners, pages)
- Reports & Activity Log views
- User management (Super Admin)
- **Verify:** Full admin flows work end-to-end

### Phase 4: Public Website
- Homepage (hero, trust bar, categories, featured, "Why Talukder")
- Mega-menu navigation (3-level category tree)
- Category & product listing pages (grid/list, filters, sort, pagination)
- Product detail page (gallery, spec table, related, enquiry buttons)
- Search with auto-suggest
- Wishlist (Zustand + localStorage)
- Enquiry flow (cart-like list → form → confirmation)
- Compare page
- Static pages (About, Contact, Certifications, Factory, FAQ, Downloads)
- Mega-footer, WhatsApp floating button
- Branded 404 & empty states
- **Verify:** All pages render, navigation works, responsive

### Phase 5: SEO & Performance Polish
- react-helmet-async for meta tags, JSON-LD
- Static pre-rendering setup (React Router v7 or vite-react-ssg)
- Dynamic sitemap.xml endpoint
- Self-hosted fonts (Inter), preloaded
- Image optimization (lazy loading, blur placeholders, width/height)
- Code splitting (admin bundle separation)
- Skeleton loading states
- Lighthouse audit (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- **Verify:** Lighthouse passes, pre-rendered HTML validates

---

## Open Questions

> [!IMPORTANT]
> **1. Color palette** — Please pick Option A, B, or C above (or specify your own brand colors / hex values).

> [!IMPORTANT]
> **2. Logo file** — Do you have a Talukder uPVC logo (SVG or high-res PNG) to supply? I'll use a text placeholder until you provide it.

> [!NOTE]
> **3. Factory/manufacturing images** — The SRS references a factory gallery page. Do you have production line, QC process, or auto-belling machine photos to supply? I'll stub the page with placeholder instructions if not yet available.

> [!NOTE]
> **4. Testimonials / Client logos** — Do you have real testimonials or client company logos? I'll stub with clear placeholder content marked for the client to replace.

> [!NOTE]
> **5. Catalog PDF** — The "Downloads" page needs the full print catalog PDF. The `PVC Catalog.pdf` file in your Files folder — is this the one to use?

> [!NOTE]
> **6. Hosting target** — For the ISR-equivalent rebuild strategy (keeping pre-rendered pages fresh after admin edits), what's your deployment plan? (e.g., a VPS with PM2, Docker on a cloud VM, etc.) This determines how I wire the rebuild trigger.

---

## Environment Variables

All secrets will be in `.env.example` with clear comments. Per your instructions, here are the values I already have:

| Variable | Value (provided) |
|----------|-----------------|
| `DATABASE_URL` | `postgresql://postgres:1234@localhost:5432/talukder-upvc-new` |
| `SUPER_ADMIN_EMAIL` | `admin@talukder-upvc.com` |
| `SUPER_ADMIN_PASSWORD` | `Admin@123456` |
| `RATE_LIMIT_WINDOW_MS` | `600000` |
| `RATE_LIMIT_MAX` | `500` |
| `UPLOAD_DRIVER` | `local` |
| `UPLOAD_LOCAL_PATH` | `./uploads` |

**Still need from you** (before Phase 2):
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — I'll generate secure random strings if you want, or you supply them
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_ADDRESS`, `SALES_TEAM_NOTIFICATION_EMAIL` — only needed when we reach email sending
- `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` — optional, can skip for v1

> [!TIP]
> I can generate secure random JWT secrets for development. Just say "generate them" and I'll create strong values for `.env`.

---

## Verification Plan

### Automated Tests
```bash
# Backend unit + integration tests
cd server && npm test

# Backend e2e tests
cd server && npm run test:e2e

# Frontend e2e tests (Playwright)
cd client && npx playwright test
```

### Manual Verification
- Each phase has specific "Verify" steps listed above
- Final Lighthouse audit on key pages (homepage, product listing, product detail)
- Responsive testing across viewport sizes
- Full admin workflow walkthrough (login → CRUD → import → enquiry management)
