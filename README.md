# Blog CMS

A modern, high-performance Blog CMS consisting of an administrative management panel and a public-facing blog website.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, TypeScript, Route Handlers in `src/app/api`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: [Neon Postgres](https://neon.tech/) with [Prisma ORM v7](https://www.prisma.io/) (Neon Serverless Driver Adapter)
- **Validation**: [Zod v4](https://zod.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Runtime**: Node.js 22 or newer

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Sam-X-Dev/Blog-CMS.git
cd Blog-CMS
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and set your database connection strings:

```bash
cp .env.example .env
```

Fill in `DATABASE_URL` (pooled connection) and `DIRECT_URL` (direct connection) from your Neon Postgres console.

### 3. Database Migration & Seeding

```bash
# Run migrations
npm run db:migrate

# Seed initial categories
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Folder Structure

```text
├── .github/                 # GitHub templates and CI configs
├── prisma/                  # Prisma schema, migrations, and seed scripts
│   ├── schema.prisma        # Database models & relations
│   └── seed.ts              # Database seeding script
├── prisma.config.ts         # Prisma 7 configuration file
├── public/                  # Static assets
└── src/
    ├── app/                 # Next.js App Router (pages & API route handlers)
    │   ├── api/             # API Route Handlers
    │   ├── globals.css      # Tailwind CSS configuration & theme
    │   ├── layout.tsx       # Root layout with providers & fonts
    │   └── page.tsx         # Public landing page
    ├── components/          # Reusable UI & feature components
    │   └── ui/              # Base UI components (ConfirmDialog, etc.)
    ├── generated/           # Generated code (e.g., Prisma Client)
    ├── lib/                 # Core utilities (prisma, api-response, api-client, slugify)
    └── types/               # TypeScript type definitions
```

## API Response Format

All Route Handlers adhere to a standard JSON envelope:

```typescript
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[] | undefined>;
};
```

- **Success**: `{ success: true, message: "...", data: { ... } }`
- **Failure**: `{ success: false, message: "...", errors: { field: ["error"] } }`

## Team Ownership

- **Samarth**:
  - Admin authentication
  - Blog CRUD operations
  - Tags management
  - Admin dashboard
  - Public blog details page
- **Abhishek**:
  - Categories management
  - Rich text editor & markdown upload
  - Media & image uploads (Cloudinary)
  - Search & blog listing
  - Public layout & homepage
