# Implementation Plan - ChongLangLSCrow

## Phase 1: Infrastructure & Setup
- [ ] Initialize Next.js 14 project with Tailwind CSS and TypeScript.
- [ ] Configure `shadcn/ui` and install base components.
- [ ] Set up Supabase project (Database, Auth, Storage).
- [ ] Create database schema (Users, Posts, Comments, Likes, Series).
- [ ] Configure RLS policies for security.
- [ ] Set up environment variables (.env.local).
- [ ] Create global layout (Header, Footer, Theme Provider).

## Phase 2: Core Features
- [ ] **Authentication**
    - [ ] Login page (Email/Password).
    - [ ] Register page (Email verification).
    - [ ] Password reset flow.
    - [ ] Protected route wrapper.
- [ ] **Home Page**
    - [ ] Hero section with background image and title animation.
    - [ ] Quote carousel (from `config.json`).
    - [ ] Navigation buttons (Category filter).
    - [ ] Post list component (Card view, Pagination).
    - [ ] "About Me" section (Markdown rendering).
- [ ] **Post Detail**
    - [ ] Dynamic routing `/posts/[id]`.
    - [ ] Header with cover image, title, author info.
    - [ ] Markdown content renderer.
    - [ ] Series navigation (Previous/Next).
    - [ ] Comments section.
    - [ ] Like button and count.

## Phase 3: User Interaction
- [ ] **User Center**
    - [ ] Profile page (Avatar, Bio, Contact).
    - [ ] "My Posts" tab (Published, Pending, Rejected).
    - [ ] "My Likes" tab.
    - [ ] "My Comments" tab.
    - [ ] Edit profile functionality.
- [ ] **Creation Page**
    - [ ] Markdown editor with preview.
    - [ ] Image upload via URL (External).
    - [ ] Draft saving (Auto-save to localStorage/DB).
    - [ ] Publishing flow (Submit for review).
    - [ ] Series management modal.

## Phase 4: Admin & Advanced Features
- [ ] **Admin Dashboard**
    - [ ] Role-based access control (Admin only).
    - [ ] Post review interface (Approve/Reject).
    - [ ] Post management (Pin, Feature, Delete).
    - [ ] User management (Ban/Unban).
    - [ ] Statistics dashboard.
- [ ] **Search & Category**
    - [ ] Search functionality (Title, Content, Author).
    - [ ] Category pages.
    - [ ] Tag cloud (optional).
- [ ] **Notifications**
    - [ ] In-app inbox (Review results, System messages).
    - [ ] Toast notifications for actions.

## Phase 5: Polish & Deploy
- [ ] **UI/UX Refinement**
    - [ ] Dark mode consistency check.
    - [ ] Mobile responsiveness check.
    - [ ] Loading states and skeletons.
    - [ ] Error handling (404, 500 pages).
- [ ] **Testing**
    - [ ] Unit tests for utilities.
    - [ ] Integration tests for critical flows.
- [ ] **Deployment**
    - [ ] Deploy to Vercel.
    - [ ] Verify production build.
    - [ ] SEO optimization (Metadata, Sitemap).
