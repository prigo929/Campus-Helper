Codename: Project X

# 🎓 Campus Helper

Campus Helper is a full-stack web platform for university students to:

- Find and post part-time jobs and micro-tasks  
- Buy and sell study materials (books, notes, devices)  
- Join campus discussion forums  
- Chat with other students in real time  

It is built as a university project but follows production-style architecture: **Next.js App Router**, **TypeScript**, **Supabase**, **Tailwind CSS**, and **Vercel**, with a **Scrum** workflow tracked in **Jira** and code hosted on **GitHub**.

---

## ✨ Features

### Core Features (MVP)

- **Authentication & Profiles**
  - Email / magic link login via Supabase Auth
  - Student profile: name, faculty, study year, bio, avatar
  - Roles: `student`, `admin`

- **Dashboard**
  - Personalized home view after login
  - Quick access to Jobs, Materials, Forum, Chat, Profile
  - Summary of recent activity (jobs, posts, messages)

- **Jobs & Tasks Marketplace**
  - Create job/task with title, description, pay, category, optional location
  - Browse jobs in a responsive card layout
  - Job details page with full description and contact option
  - Sorting and basic filtering (e.g. by category, newest first)

- **Materials Marketplace**
  - Create listings for books, notes, devices, etc.
  - Upload images (Supabase Storage)
  - Materials list and detail pages
  - Contact seller via chat

- **Forum**
  - Categories (e.g. General, Jobs, Materials, Campus News)
  - Create posts with title and content
  - Comment on posts
  - Sort by newest / latest activity

- **Messaging**
  - 1:1 conversations between students
  - Started from job/material pages or profile
  - Realtime updates via Supabase Realtime

- **Reporting & Moderation**
  - Report jobs, materials, posts, comments, or users
  - Admin panel to review reports
  - Admin actions: mark as reviewed, delete content, optionally restrict users

### UX & Design

- Fully **responsive** layout (mobile, tablet, desktop)
- **Dark theme** using:
  - Navy as primary background
  - Gold as accent color
  - Off-white/soft grays for text and surfaces
- Reusable component library:
  - Buttons, inputs, cards, modals, avatars, badges, skeletons
- Loading states (skeletons), error toasts, and friendly empty states

### Planned / Stretch Features

- **Ratings & Reviews**
  - Rate users after completing a job or transaction
  - Show average rating on profile

- **Notifications**
  - In-app notifications for:
    - new messages
    - job applications or interest
    - comments on your forum posts

- **Global Search**
  - Search across jobs, materials, and forum content

- **AI Assistant (Future)**
  - Campus Helper AI for:
    - job/material suggestions
    - summarizing forum threads or notes
    - answering common campus questions
  - Likely via Vercel AI SDK + a free LLM API

---

## 🧱 Tech Stack

**Frontend / App**

- [Next.js 14 (App Router)](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- (Optional) [Framer Motion](https://www.framer.com/motion/) for animations
- [TanStack Query (React Query)](https://tanstack.com/query/latest) for data fetching & caching

**Backend / Data**

- [Supabase](https://supabase.com/)
  - PostgreSQL database
  - Supabase Auth
  - Storage (files & images)
  - Realtime (chat/messages, live updates)
  - Row Level Security (RLS) policies

**DevOps / Tooling**

- Deployment: [Vercel](https://vercel.com/)
- Version Control: Git + GitHub
- CI/CD: GitHub Actions (lint, type-check, build, tests)
- Project Management: Jira (Scrum: epics, stories, sprints)
- Design: Figma (design system, components, screens)
- Linting & Formatting: ESLint, Prettier

---

## 🧬 Architecture Overview

**Frontend**

- Next.js App Router with route groups:
  - `(public)` – landing, marketing
  - `(auth)` – login, register
  - `(dashboard)` – authenticated area (jobs, materials, forum, chat, profile, admin)
- Component-driven UI:
  - `components/ui` – generic UI elements (Button, Card, Input, Modal, etc.)
  - `features/*` – domain-specific logic and components (jobs, materials, forum, messaging, admin)
- React Query for data synchronization and caching
- Client vs server components:
  - Server components for data fetching where possible
  - Client components for interactive UI (forms, chat, etc.)

**Backend**

- Supabase as the backend:
  - PostgreSQL database for all relational data
  - Auth tied to `auth.users` and `profiles` table
  - Realtime subscriptions for messages and live updates
  - Storage buckets for materials images and avatars
  - RLS policies to enforce security at the row level

**Infrastructure**

- Vercel for hosting Next.js app (production + preview deployments)
- GitHub Actions for:
  - linting
  - formatting checks
  - TypeScript type checking
  - Next.js build
  - tests (unit and E2E once added)

---

## 📂 Project Structure (Planned)

```text
src/
  app/
    (public)/
      landing/
        page.tsx
    (auth)/
      login/
        page.tsx
      register/
        page.tsx
    (dashboard)/
      layout.tsx
      page.tsx
      jobs/
        page.tsx
        [id]/
          page.tsx
        create/
          page.tsx
      materials/
        page.tsx
      forum/
        page.tsx
      chat/
        page.tsx
      profile/
        page.tsx
      admin/
        reports/
          page.tsx
    api/
      ai/route.ts          # (optional future AI endpoint)
      jobs/route.ts        # (if using Next API routes)
    layout.tsx
    globals.css

  components/
    ui/
      button.tsx
      input.tsx
      card.tsx
      modal.tsx
      avatar.tsx
      skeleton.tsx
    layout/
      navbar.tsx
      page-header.tsx

  features/
    auth/
    jobs/
      components/
      hooks/
      api/
      types/
    materials/
    forum/
    messaging/
    notifications/
    ratings/
    admin/

  lib/
    supabase/
      browser.ts
      server.ts
    api/
      fetcher.ts
    utils/
      cn.ts
      format-date.ts

  context/
    AuthContext.tsx
    ThemeContext.tsx
    NotificationsContext.tsx

  hooks/
    useAuth.ts
    useDebounce.ts
    useResponsive.ts

  styles/
  types/
  tests/
