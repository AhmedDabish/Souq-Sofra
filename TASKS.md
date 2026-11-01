# 📋 Souq & Sofra - Tasks & Project Roadmap (TASKS.md)

> ### 🚨 Quick-Start Directive (For any AI assistant or developer opening this repository):
> **"If this is your first time opening this project, read this file thoroughly from beginning to end to understand the architecture, structure, and current status. Review all completed tasks `[x]` and pending tasks `[ ]`. NEVER start the project from scratch! Identify the first uncompleted task, implement it directly with high quality, update this file by marking it `[x]`, and commit & push changes to GitHub."**

---

## 📌 Project Overview & System Architecture
**Souq & Sofra (سوق وسفرة)** is an end-to-end full-stack restaurant and bakery e-commerce platform and management system. The design, UX patterns, and customer journey are strictly inspired by **[More-In](https://morein-eg.com/ar)**, customized with the official branding, logo, and authentic menu items of **Souq & Sofra**.

### 🛠 Technology Stack
- **Frontend:** Angular 18+ (Standalone Components, Signals, Tailwind CSS, Lucide Icons, Full RTL & LTR Support, Arabic Typography via Cairo & Baloo Bhaijaan 2).
- **Backend:** .NET 8 Web API (Clean Architecture: Domain, Application, Infrastructure, API).
- **Database:** Microsoft SQL Server (Entity Framework Core 8, Stored Procedures, Relational Constraints, Seed Data).
- **Assets:**
  - Official Brand Logo: `assets/MAIN.jpg`
  - Complete Menu & Pricing: `assets/Souq_Sofra_Menu.png`

---

## 📂 Repository Directory Layout
```text
Souq-Sofra/
├── TASKS.md                      # Roadmap, granular task tracker, and continuity directive
├── README.md                     # Comprehensive setup, run, and architecture documentation
├── assets/                       # Brand and menu resources
│   ├── MAIN.jpg                  # Official Souq & Sofra brand logo
│   └── Souq_Sofra_Menu.png       # Complete menu, sections, and pricing
├── database/                     # SQL Server scripts
│   ├── 01_Schema.sql             # Tables, foreign keys, indexes, and constraints
│   └── 02_SeedData.sql           # Menu categories, actual items, prices, and admin seed
├── Backend/                      # .NET 8 Clean Architecture solution
│   ├── SouqSofra.Domain/         # Domain entities, enums, value objects
│   ├── SouqSofra.Application/    # DTOs, service interfaces, business logic
│   ├── SouqSofra.Infrastructure/ # EF Core DbContext, entity configs, repositories
│   └── SouqSofra.API/            # Controllers, JWT auth, middleware, Program.cs
└── Frontend/                     # Angular 18+ client application
    └── src/
        └── app/
            ├── core/             # Auth, token interceptor, route guards, state, API service
            │   ├── guards/       # Route guards (authGuard)
            │   ├── interceptors/ # HTTP interceptors (authInterceptor for JWT Bearer)
            │   ├── models/       # TypeScript interfaces matching backend DTOs
            │   └── services/     # ApiService, AuthService, CartService, LanguageService
            ├── features/
            │   ├── public/       # Customer-facing storefront (More-In design parity)
            │   │   ├── components/ # Header, Hero Slider, Category Slider, Product Card, Cart
            │   │   └── pages/      # Home, Menu, Checkout, Contact
            │   └── admin/        # Isolated Admin Dashboard (/admin)
            │       ├── components/ # AdminSidebar
            │       └── pages/      # Dashboard Overview, Products, Orders, Settings, Login
            └── shared/           # Reusable UI components & pipes
```

---

## 🎯 Granular Task Checklist & Progress Log

### Phase 1: Requirements Analysis, Architecture & Assets Preparation [COMPLETE - 100%]
- [x] **Task 1.1**: Analyze More-In UI/UX structure, extracting color palettes (dark navy/black, gold/amber accents), fonts, layout hierarchies, and responsive navigation models.
- [x] **Task 1.2**: Digitize and parse all product categories, food items, bakery goods, and prices from `Souq_Sofra_Menu.png`.
- [x] **Task 1.3**: Establish clean repository folder hierarchy (`assets/`, `database/`, `Backend/`, `Frontend/`).
- [x] **Task 1.4**: Compile official brand assets (`MAIN.jpg`, `Souq_Sofra_Menu.png`) into project assets.

---

### Phase 2: Database Design & SQL Server Scripts [COMPLETE - 100%]
- [x] **Task 2.1**: Design relational schema for categories, products, variants, orders, order items, customers, admin users, and site configurations.
- [x] **Task 2.2**: Write `database/01_Schema.sql` with foreign key constraints, indexes, cascade rules, and audit timestamps.
- [x] **Task 2.3**: Write `database/02_SeedData.sql` populating real Souq & Sofra categories (Fatayer, Pastries, Grills, Main Dishes, Bakery, Beverages) with bilingual Arabic/English names and prices.
- [x] **Task 2.4**: Add default administrator credentials and role assignments in database seed script with PBKDF2 hash.

---

### Phase 3: Backend - .NET 8 Web API (Clean Architecture) [COMPLETE - 100%]
#### 3.1 Domain Layer
- [x] **Task 3.1.1**: Create `Category` entity with bilingual names, icon, banner URL, display order, and active status.
- [x] **Task 3.1.2**: Create `Product` entity with category FK, pricing, discount, calories, tags (popular/new), and image URL.
- [x] **Task 3.1.3**: Create `ProductVariant` entity (Small, Medium, Large sizes with price deltas).
- [x] **Task 3.1.4**: Create `Order` and `OrderItem` entities supporting order statuses, delivery address, notes, and payment methods.
- [x] **Task 3.1.5**: Create `User` entity for administrative authentication with PBKDF2 password hashing and role definitions.
- [x] **Task 3.1.6**: Create `SiteSetting` entity for dynamic header announcements, contact phone, delivery fees, and social links.
- [x] **Task 3.1.7**: Create `Branch` entity for restaurant branches, coordinates, phone numbers, and WhatsApp links.

#### 3.2 Infrastructure Layer
- [x] **Task 3.2.1**: Implement `AppDbContext` with EF Core entity configurations, relational foreign keys, cascade rules, and Fluent API mappings for all 8 entities.
- [x] **Task 3.2.2**: Configure SQL Server connection string in `appsettings.json`.

#### 3.3 Application Layer
- [x] **Task 3.3.1**: Create Data Transfer Objects (DTOs) for categories, products, variants, orders, order items, checkout requests, auth payloads, settings, and branches.
- [x] **Task 3.3.2**: Implement `PasswordHasher` with cryptographic PBKDF2 (SHA-256 with random 128-bit salt and 100,000 iterations).

#### 3.4 API Controllers & Security
- [x] **Task 3.4.1**: Build `CategoriesController` with endpoints for public listing, single item retrieval, and admin CRUD operations secured with `[Authorize(Roles = "Admin")]`.
- [x] **Task 3.4.2**: Build `ProductsController` with public catalog filtering, search query support, admin full-listing (`/admin/all`), product variants creation, and availability toggle.
- [x] **Task 3.4.3**: Build `OrdersController` for guest/customer checkout creation and admin order management (listing, detail, status patch).
- [x] **Task 3.4.4**: Build `AuthController` with real signed JWT token generation (`JwtSecurityTokenHandler`), Claims (Id, Name, Email, Role), PBKDF2 password verification, `GET /api/auth/me`, and `POST /api/auth/change-password`.
- [x] **Task 3.4.5**: Build `SettingsController` to serve dynamic brand metadata and admin PUT endpoint.
- [x] **Task 3.4.6**: Build `BranchesController` for branch discovery and admin additions.
- [x] **Task 3.4.7**: Configure CORS policies, JWT Bearer authentication, and Swagger Bearer Token documentation in `Program.cs` and `SouqSofra.API.csproj`.

---

### Phase 4: Frontend - Angular 18 Foundation & More-In Theme [COMPLETE - 100%]
- [x] **Task 4.1**: Configure Angular project setup (`angular.json`, `tailwind.config.js`, TypeScript compiler options).
- [x] **Task 4.2**: Set up custom More-In color palette (luxury gold `#C5A880`, deep onyx `#121212`, off-white `#F9F9F9`) and Arabic typography (Cairo font).
- [x] **Task 4.3**: Implement Core services:
  - `ApiService`: Generic HTTP request wrapper connecting to `.NET 8 Web API`.
  - `CartService`: Reactive cart state using Angular Signals, persistent in `localStorage`.
  - `AuthService`: Real JWT token management, login status via HTTP POST, and role inspection.
  - `LanguageService`: RTL/LTR direction switching and Arabic/English language toggle.
- [x] **Task 4.4**: Build Global Header matching More-In:
  - Souq & Sofra circular logo.
  - Branch and delivery location selector.
  - Desktop navigation links with active indicators.
  - Expanding live search input.
  - Language toggle button (عربي / English).
  - Floating cart badge with live quantity count.
  - Admin/Customer login CTA button.
- [x] **Task 4.5**: Build Mobile Bottom Navigation Bar (Home, Categories, Floating Cart Button, Orders/Favorites, Account).

---

### Phase 5: Customer Storefront Features (Public Pages) [COMPLETE - 100%]
- [x] **Task 5.1**: Build Hero Banner Carousel with smooth transitions, promotional CTA, and circular accent badges.
- [x] **Task 5.2**: Build Quick Categories Horizontal Swiper with circular category icons and responsive touch scrolling.
- [x] **Task 5.3**: Build Product Card component:
  - Image thumbnail with badge (Best Seller, Special Offer).
  - Title, description, and calorie counter.
  - Price display with strikethrough for discounted items.
  - Interactive "Add to Cart" button with quantity selector upon addition.
- [x] **Task 5.4**: Build Interactive Cart Drawer:
  - Slide-in side panel with smooth backdrop blur.
  - Item listing with quantity increment/decrement and removal.
  - Subtotal, delivery fee calculation, and dynamic total.
  - Direct checkout button.
- [x] **Task 5.5**: Build Checkout Page:
  - Customer information form (Name, Phone number, Delivery address).
  - Branch pickup vs. Home delivery toggle.
  - Payment method selection (Cash on Delivery, Credit Card).
  - Order summary breakdown and submission confirmation connected to `POST /api/orders`.
- [x] **Task 5.6**: Build Store Locations & Contact Page connected to dynamic `GET /api/branches` based on Abu Dhabi contact info from the menu.

---

### Phase 6: Isolated Admin Dashboard (`/admin`) [COMPLETE - 100%]
- [x] **Task 6.1**: Build dedicated Admin Layout with collapsable sidebar navigation, user profile badge, active routes highlighting, and route guard protection (`authGuard`).
- [x] **Task 6.2**: Build Dashboard Overview metrics:
  - Live total sales and revenue calculated from orders.
  - Orders count with status breakdown (Pending, Preparing, Out for Delivery, Completed).
  - Real-time active menu items and active branches count.
  - Recent live orders table with quick view and link to orders management.
- [x] **Task 6.3**: Build Product Management interface:
  - Full CRUD against `GET /api/products/admin/all`, `POST /api/products`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`.
  - Quick availability toggle via `PATCH /api/products/{id}/availability`.
  - Category filtering and bilingual live search.
  - Add & Edit modal with Arabic/English names, prices, categories, image URL, and variants.
- [x] **Task 6.4**: Build Live Orders Management interface:
  - Live orders fetched from `GET /api/orders`.
  - Status filter tabs (All, Pending, Preparing, Out for Delivery, Completed).
  - Live status change dropdown calling `PATCH /api/orders/{id}/status`.
  - Detailed modal showing ordered items, quantities, unit prices, subtotal, delivery fee, customer info, and notes.
  - Order deletion with confirmation calling `DELETE /api/orders/{id}`.
- [x] **Task 6.5**: Build Store & Website Settings interface (`/admin/settings`):
  - Announcement banner text, restaurant phone, WhatsApp number, default delivery fee, minimum order amount, and VAT percentage.
  - Settings update calling `PUT /api/settings`.
  - Branch discovery and adding new branches calling `POST /api/branches`.

---

### Phase 7: Integration, Verification & Quality Assurance [COMPLETE - 100%]
- [x] **Task 7.1**: Validate end-to-end API communication between Angular client services and .NET 8 controllers.
  - [x] **Task 7.1.1**: Connect all public and admin services to .NET 8 API endpoints (`http://localhost:2811/api`).
  - [x] **Task 7.1.2**: Implement `authInterceptor` to attach `Authorization: Bearer <token>` to requests and handle 401 redirection to `/admin/login`.
  - [x] **Task 7.1.3**: Pass Angular production build (`ng build`) with zero errors.
  - [x] **Task 7.1.4**: Verify models and DTO contracts between frontend TypeScript and backend C# records.
  - [x] **Task 7.1.5**: Secure Admin Dashboard with real JWT authentication, protected routes, and role enforcement.
- [x] **Task 7.2**: Verify database schema and relational constraints between SQL Server scripts (`01_Schema.sql`, `02_SeedData.sql`) and EF Core `AppDbContext`.
- [x] **Task 7.3**: Verify responsive layouts across mobile, tablet, and desktop viewports adhering to More-In luxury aesthetic.
- [x] **Task 7.4**: Verify full RTL direction support, Arabic typography (Cairo font), and bilingual translations.
- [x] **Task 7.5**: Verify full cart lifecycle and order creation integration end-to-end.

---

### Phase 8: Source Control & GitHub Delivery
- [x] **Task 8.1**: Initialize local Git repository with `.gitignore` for .NET, Angular, and SQL Server artifacts.
- [x] **Task 8.2**: Create structured commit history for initial project scaffolding.
- [x] **Task 8.3**: Configure remote origin to `https://github.com/AhmedDabish/Souq-Sofra.git`.
- [x] **Task 8.4**: Push all branches, assets, database scripts, backend code, and frontend code to GitHub repository.
- [x] **Task 8.5**: Maintain and update `TASKS.md` with every subsequent feature branch and commit.
