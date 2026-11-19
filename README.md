# SalonBook &mdash; Frontend

> A modern, premium salon and wellness appointment booking platform.

## 🌟 Overview
SalonBook provides a seamless, elegant digital experience for salon clients and specialists. Clients can explore hair, skincare, nail, and spa services, schedule appointments with real-time slot selection, and manage bookings effortlessly.

- **Live URL**: [https://salonbook-virid.vercel.app/](https://salonbook-virid.vercel.app/)
- **Backend API URL**: [https://salonbook-server-roan.vercel.app/](https://salonbook-server-roan.vercel.app/)

---

## 🛠️ Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **UI Library**: [React 19](https://react.dev)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with CSS design tokens
- **Icons**: [Lucide React](https://lucide.dev)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Date Utilities**: [date-fns](https://date-fns.org)

---

## 📁 Project Structure
```text
salonbook/
├── public/                 # Static assets & branding
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── dashboard/      # User appointment dashboard
│   │   ├── login/          # Sign-in portal
│   │   ├── register/       # User registration
│   │   ├── services/       # Salon service catalog
│   │   ├── globals.css     # Global design system & theme tokens
│   │   ├── layout.tsx      # Root layout with Navbar, Footer & Toaster
│   │   └── page.tsx        # Homepage
│   ├── components/
│   │   ├── booking/        # Booking & appointment components
│   │   ├── home/           # Homepage hero & feature sections
│   │   ├── layout/         # Shared Navbar & Footer
│   │   ├── services/       # Service cards & filters
│   │   └── ui/             # Reusable UI primitives (Button, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API configuration & utility functions
│   └── types/              # TypeScript definitions & data models
├── .env.example            # Environment variables template
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` to configure your environment:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API | `http://localhost:5000` |

> [!NOTE]
> Environment files (`.env`, `.env.local`) are strictly excluded by `.gitignore` and must never be committed to Git.

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run local development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production
```bash
npm run build
```

---

## 📄 License
Private project for SalonBook. All rights reserved.
