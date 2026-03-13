# Acceptance Checklist - ChongLangLSCrow

## 1. Environment & Config
- [ ] Project initialized with Next.js 14 and Tailwind CSS.
- [ ] Supabase project connected and tables created.
- [ ] Environment variables configured correctly.
- [ ] Basic `config.json` created for quotes and static assets.
- [ ] Favicon and background image placed in `/public`.

## 2. Authentication
- [ ] User can register with valid email (format check).
- [ ] User receives confirmation email (mock or real).
- [ ] User can login with email/password.
- [ ] User can logout.
- [ ] Password reset flow works.
- [ ] Unauthorized users redirected from protected routes.

## 3. Home Page
- [ ] Title animation (fade out on scroll) works.
- [ ] Quote carousel cycles through config entries.
- [ ] Day/Night mode toggle persists and applies globally.
- [ ] Navigation buttons filter posts correctly.
- [ ] "About Me" renders Markdown correctly.
- [ ] Post cards display all required info (title, author, date, summary, likes, comments).
- [ ] Post card hover effect shows text preview.

## 4. Post Detail
- [ ] Post page loads via dynamic route `/posts/[id]`.
- [ ] Cover image and blurred title background render correctly.
- [ ] Markdown content renders properly (headers, lists, code blocks).
- [ ] Series navigation buttons (Previous/Next) work correctly.
- [ ] Comments section loads and allows posting (for logged-in users).
- [ ] Like button toggles state and updates count.
- [ ] Share button copies link or opens share dialog.

## 5. User Center
- [ ] Profile information displays correctly.
- [ ] Avatar loads from external URL.
- [ ] "My Posts" tab shows correct status (Published/Pending/Rejected).
- [ ] "My Likes" links to correct posts.
- [ ] "My Comments" links to correct comments.
- [ ] Profile edit form validates and saves changes.

## 6. Creation Page
- [ ] Editor loads with preview pane.
- [ ] Auto-save mechanism works (check localStorage or draft status).
- [ ] Image insertion via URL works.
- [ ] Series management modal allows creating/selecting series.
- [ ] "Publish" button changes status to "Pending".
- [ ] "Save Draft" button saves without submitting.

## 7. Admin Dashboard
- [ ] Only accessible by users with `role: admin`.
- [ ] "Pending" posts list is accurate.
- [ ] "Approve" action changes status to "Published".
- [ ] "Reject" action requires reason and changes status to "Rejected".
- [ ] Rejected reason is visible to author.
- [ ] "Delete" action removes post (soft or hard delete).
- [ ] "Pin" and "Feature" actions update post flags.

## 8. General & Non-Functional
- [ ] Search returns relevant results.
- [ ] Mobile view is usable and responsive.
- [ ] Dark mode colors are consistent and legible.
- [ ] 404 page appears for non-existent routes/posts.
- [ ] Toast notifications appear for success/error actions.
