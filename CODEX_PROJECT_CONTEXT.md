# Skavyra project context

Read-only onboarding notes based on the repository contents inspected on 2026-09-29. The implementation is the source for behavior; product and database behavior that depends on absent backend configuration is explicitly marked unknown.

## Project overview

Skavyra is an education and course-management website for IT and non-IT graduates. It combines a public course catalogue and enquiry funnel with student learning/payment pages, counsellor lead management, and an admin console. This description is supported by the implemented routes, UI copy, and data access. Whether every advertised education service is currently delivered operationally cannot be established from this repository.

## Technology stack

- Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS 3.
- Supabase Auth, Postgres, Storage, SSR helpers, RPCs, and Deno Edge Functions.
- Zod form validation; Radix UI primitives and shadcn-style local components; Lucide icons; Sonner toast notifications.
- Recharts for report visualisations; SheetJS (`xlsx`) for spreadsheet import/export; jsPDF and jsPDF AutoTable for PDF generation.
- Package versions in `package.json` are semver ranges. No dependency installation or build/type/lint command was run, so runtime-resolved versions and compatibility have not been verified.

## Architecture

The Next.js App Router renders public and protected pages. Server Components use a cookie-aware Supabase server client with the public anon key and the signed-in user's session. Client Components use the browser Supabase client for auth, storage uploads, and interactive UI. Server Actions validate inputs, check the current user's role in application code, perform user-scoped Supabase table/RPC operations, and revalidate paths. The RLS policies and SQL functions are intended to enforce database permissions as a second layer, but their definitions are not present here.

Four Supabase Edge Functions are included. `create-user`, `deactivate-staff`, and `simulate-payment` authenticate the caller with their user token, then use the Supabase service-role key for privileged operations. `razorpay-webhook` authenticates the Razorpay request by HMAC and uses the service role. Their environment secrets are configured in Supabase, not Next.js.

## Folder structure

- `src/app/(marketing)`: home, course catalogue/details, about, contact, terms/privacy, public certificate verification.
- `src/app/(auth)`, `src/app/auth/callback`: login, signup, Google OAuth entry point, email confirmation, forgot/reset password, callback exchange.
- `src/app/dashboard`: student overview, courses/player, payments, certificates, profile.
- `src/app/employee`: counsellor overview, own leads, add lead, course list, performance.
- `src/app/admin`: leads/import, employees, students/enrolments, courses/editor, payments, reports, offer letters/import, settings.
- `src/app/api`: health endpoint and lesson/resource URL signing endpoint.
- `src/actions`: server actions grouped by contact, leads, enrolments/progress/certificates, payments, courses, profiles, settings, staff, and offer letters.
- `src/components`: area components, reusable dashboard/marketing/player/payment/lead/course/offer-letter components, and local UI primitives in `ui`.
- `src/lib`: Supabase clients, auth helpers, validations, constants/content, lead queries, Excel parsing/mapping/deduplication, PDF generation, and Edge Function fetch helper.
- `src/hooks`, `src/types`: client hooks and generated-style Supabase database types / app types.
- `supabase/functions`: four Deno function entry points. The SQL export mentioned by README is absent from this checkout.
- `public`: logo marks, favicon, and social image.

## Application flow

### Public discovery and enquiry

The home page and `/courses` query published `courses` through the server Supabase client. Course detail loads its published course plus `course_outline`, which is grouped into modules; preview lessons are exposed in the syllabus. A guest's enrol action leads to signup. A signed-in student without an enrolment submits a course enquiry through `requestEnrollment` → `submitContact` → `submit_contact_lead()` RPC. The public contact form uses the same RPC and can annotate a college enquiry. Staff later distribute and work leads.

### Student account and learning

Email/password and Google OAuth use Supabase Auth. Signup sends name/phone metadata and relies on a database trigger (called `handle_new_user` in a comment) to create profile/student role; that trigger definition is not in the checkout. Email links return through `/auth/callback`, which exchanges the code for a session and routes by role or `next`.

Student routes require the `student` role in both middleware and the dashboard layout. The dashboard fetches enrolments, course outline, lesson progress, live lessons, and due instalments. The player requests lesson/resource URLs from `/api/lesson-url`; that route reads lesson/resource rows and issues two-hour Storage signed URLs or maps external Drive/YouTube/Bunny/Zoom content. Students can save lesson progress through `markLessonComplete` and visit records through `touchLesson`. Certificate records are issued by an admin RPC; the browser builds/uploads the PDF, and public verification calls `verify_certificate()`.

### Counsellor leads

Employees see leads assigned to their user id, create leads assigned to themselves, update lead status/follow-up/courses, and upload payment proof for eligible leads. Admins can add, import, soft-delete, distribute, and reassign leads. The app calls `assign_leads()` and `import_leads()` RPCs for those bulk operations. Lead detail/activity history is read from lead, course, and activity tables; comments indicate status history is database-triggered and non-status edits add activity rows from the server action. Trigger behavior cannot be verified here.

### Enrolment and payments

Staff create a student enrolment via `create_enrollment()` RPC, passing course, full/partial plan, totals/installments, optional lead, and source. Student payment UI explicitly describes payments as simulated. `payNow` calls the `simulate-payment` Edge Function, which verifies ownership/role, checks remaining balance, writes a payment row with service-role access, then calls `apply_payment()`. Admins review offline UPI proof and call `apply_payment()` to verify it. The Razorpay webhook is a future integration path; there is no Razorpay checkout/order-creation flow in the app code.

### Admin operations

Admins manage employees/accounts, course/module/lesson content, student enrolments/access/certificates, payment verification, offer-letter generation/import, settings, and reports. Staff account creation/deactivation crosses into service-role Edge Functions. Course media and other files use Supabase Storage buckets named in `src/lib/constants.ts`.

## Authentication and authorization

- `src/lib/supabase/client.ts`, `server.ts`, and `middleware.ts` construct browser, server, and cookie-refresh clients from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Middleware calls `auth.getUser()`, refreshes cookies, reads `user_roles`, gates `/admin`, `/employee`, and `/dashboard`, and redirects authenticated users away from login/signup/forgot-password.
- Panel layouts and most privileged server actions also call `requireRole` or `currentUserWithRole`. `requireRole` rejects inactive profiles when a profile row is available.
- Database RLS is relied upon for data-level isolation; no policy source is included, so role/table/storage boundaries cannot be independently confirmed. Client-side role hooks are presentation helpers, not an authorization boundary.
- Auth UI includes email/password, Google OAuth, signup consent checkbox, email confirmation, password reset, and sign-out. Provider settings and Supabase redirect allowlists are external configuration and unknown.

## Database

Database technology is Supabase Postgres. `src/types/database.types.ts` describes these public tables: `profiles`, `user_roles`, `employees`, `audit_logs`, `app_settings`, `email_log`, `courses`, `course_modules`, `lessons`, `lesson_resources`, `enrollments`, `installments`, `payments`, `progress`, `certificates`, `lead_upload_batches`, `student_leads`, `lead_courses`, `lead_activities`, `offer_letter_templates`, `offer_letter_batches`, and `offer_letters`. It also describes the `course_outline` view.

Key relationships from generated type metadata include profiles keyed by auth user id; roles and employee records per user; courses → modules → lessons → resources; users/courses → enrolments → instalments/payments/certificates; users/lessons → progress; lead batches/leads/activities/course interests; and offer-letter batches/templates/creator/reporting manager. Important enum groups cover roles, course category/level/status, lesson type/provider, access/payment states, lead status/source, employment/pay periods, and offer-letter status.

Typed RPC names include role/access helpers (`has_role`, `is_admin`, `is_employee`, `is_staff`, `has_course_access`, `lesson_course_id`), enrolment/payment/certificate functions (`create_enrollment`, `recalc_enrollment`, `apply_payment`, `issue_certificate`, `verify_certificate`), lead functions (`submit_contact_lead`, `find_lead_owner`, `import_leads`, `assign_leads`), user functions (`provision_user`, `deactivate_staff`), and offer-letter import/number helpers (`import_offer_letters`, `next_letter_no`). Generated types show signatures only, not function implementation, grants, RLS, triggers, constraints, indexes, or storage policies.

The README says `supabase/skavyra_backend_full.sql` contains the schema and should be run on an empty project. It is not present in the working tree; `.gitignore` explicitly excludes that path. Do not treat README descriptions of policies/functions/triggers as independently verified backend facts.

## APIs and backend

- `GET /api/health`: returns `{ ok: true, time }`.
- `GET /api/lesson-url?lessonId=...` or `?resourceId=...`: reads accessible lesson/resource metadata and returns a signed storage URL or provider-specific playback/link response. Actual authorization depends on absent RLS/storage policies.
- Server Actions in `src/actions/*`: business entry points detailed in the flows above; schemas live in `src/lib/validations`.
- Supabase Edge Functions: `/functions/v1/create-user`, `deactivate-staff`, `simulate-payment`; `razorpay-webhook` intended for provider callbacks.

## Environment variables

Names only; no local values were read or recorded.

| Variable | Apparent use |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase browser/server/middleware clients, Edge Function URL, Next image host. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public-key Supabase clients and Edge Function `apikey` header. |
| `NEXT_PUBLIC_SITE_URL` | Site metadata/base URL and certificate verification links. |
| `SUPABASE_URL` | Supabase Edge Function project connection. |
| `SUPABASE_ANON_KEY` | Edge Functions' caller-authenticated Supabase clients. |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged operations inside Edge Functions only. |
| `ALLOWED_ORIGIN` | Edge Function CORS allow-origin; code defaults to `*`. |
| `RAZORPAY_WEBHOOK_SECRET` | HMAC verification for Razorpay webhook. |

The repository also has `.env.local`, which was deliberately not opened. `.env.example` contains variable names with blank Supabase values and a local site URL. README claims local values are set, but this report does not verify their presence or values.

## Important components and helpers

- `components/dashboard/AppShell`, `Sidebar`, `Topbar`: shared role panel shell.
- `components/marketing/*`: public landing, catalogue, contact, navigation, and content sections.
- `components/leads/*`: lead tables/details, assignment, payment proof, and import wizard.
- `components/player/*`: course player, lesson list, media, and resources.
- `components/payments/*`: simulated pay button, enrolment/installment setup, offline verification queue, transaction table.
- `components/courses/*`, `components/offer-letters/*`, `components/staff/*`: admin editors and workflows.
- `lib/leads-query.ts`: shared filters/pagination/detail reads; `lib/excel/*`: spreadsheet import helpers; `lib/pdf/*`: browser PDF builders.

## Important dependencies and configuration

Declared direct versions include `next ^15.5.0`, `react/react-dom ^19.1.0`, `@supabase/ssr ^0.12.7`, `@supabase/supabase-js ^2.47.10`, TypeScript `^5.7.2`, Tailwind `^3.4.17`, Zod `^3.24.1`, `xlsx ^0.18.5`, `jspdf ^2.5.2`, `jspdf-autotable ^3.8.4`, and `recharts ^2.15.0`. UI uses Radix packages, `class-variance-authority`, `clsx`, and `tailwind-merge`.

`next.config.ts` derives allowed remote images from the Supabase host and sets Server Action body size to 10 MB. TypeScript alias `@/*` maps to `src/*`. Tailwind design tokens/fonts are in `tailwind.config.ts` and `src/app/globals.css`; local UI component conventions are described by `components.json`. Scripts declare dev/build/start/lint/typecheck; no scripts were executed during onboarding.

## Current implementation status

- Implemented in repository: public course browsing/enquiry, email/password and Google OAuth UI integration, role-specific panels, lead lifecycle/import, course editing/player/progress, enrolment/installment administration, simulated payments/offline payment verification, certificates, offer letters, reports/settings.
- Explicitly simulated/not live: the student pay action; UI says no card/UPI checkout is enabled. The Razorpay webhook source exists, but the frontend has no order/checkout creation path and README says to deploy it when Razorpay goes live.
- Empty/conditional: testimonials are an empty constant and the section is designed to hide when empty.
- External setup dependent: Supabase auth providers/redirects, deployed Edge Functions, schema/RPCs/RLS/storage buckets, and all required Supabase secrets. No deployment state was inspected.
- Unclear: whether the SQL export is stored outside this checkout, whether migrations exist elsewhere, whether the schema types match the deployed database, and which pages/features are in production.

## Known issues and observations

### Confirmed from checked-in code

- The admin students route applies `q` text filtering to rows only after the database query has already fetched the current 25-row page. Search results therefore cover only that fetched page, while pagination totals still count the unfiltered query. Evidence: `src/app/admin/students/page.tsx`.
- Course publishing checks that at least one module exists, but its error says there must be a module “with a lesson”; the code does not count/check lessons before setting status to published. Evidence: `src/actions/courses.ts`.
- The README identifies a full SQL schema export, but that file is missing from the checkout and ignored by `.gitignore`; database-level behavior cannot be audited from these files.

### Potential issues; verify against intended behavior/backend

- `/auth/callback` redirects to `origin + next` without validating that `next` is a local relative path. Most UI-generated values are local paths, but a crafted `next` parameter may create an unsafe redirect depending on URL parsing/browser behavior. Review before changing.
- `razorpay-webhook` compares the supplied HMAC using ordinary string equality. A timing-safe comparison is generally preferable; also confirm payment amount/currency and event idempotency protections in the database function (body unavailable).
- Edge Functions default CORS to `*` when `ALLOWED_ORIGIN` is unset. Auth/authorization still exists in function code, but deployment origin policy should be checked.
- Lesson/resource signing's access safety depends on row-level and Storage policies not present in this checkout. Do not infer safety from route comments alone.
- Many dashboard/report/admin queries read broad sets and aggregate in application code; Supabase row caps/performance behavior may affect totals at scale. The actual project limits are unknown.

### Needs confirmation

- Is `supabase/skavyra_backend_full.sql` maintained elsewhere, and can its current version be provided for a reliable RLS/schema/trigger audit?
- Are live Razorpay payments planned now, or is simulation the desired current behavior?
- Does the deployed Supabase schema match `src/types/database.types.ts`?
- Are Google OAuth and email confirmation enabled in the deployed Supabase project?

No typecheck, lint, build, tests, or runtime checks were run, so compile/runtime errors and dependency compatibility remain unassessed. Git status also could not be read because Git refused the checkout as dubious ownership; I did not change global Git configuration.

## Important technical decisions visible in code

- `/dashboard` is the student panel; `/employee` and `/admin` are separate role areas.
- Browser/server clients use the anon key plus the user's session; privileged service-role actions are limited to Edge Functions.
- Course enquiries are captured as leads for staff follow-up rather than self-service enrolment by the student.
- Simulated and future Razorpay settlement are designed to converge on the `apply_payment()` RPC.
- Spreadsheet content is parsed in the browser and submitted to database import RPCs; PDF generation is browser-side.
- Lead records use soft deletion (`deleted_at`) in application queries.

## Things not to change without explicit confirmation

- Database schema, triggers, RPC definitions/grants, RLS and Storage policies, and production data.
- Role assignment, auth callback/redirect behavior, account provisioning/deactivation, and service-role Edge Function boundaries.
- Payment settlement, offline verification, refunds/access state, certificate issuance/revocation, and webhook behavior.
- Lead assignment/import/deduplication and course access rules.
- Environment secrets and deployment/provider settings.

## Open questions

1. Can you provide the excluded SQL export or another authoritative schema/policy source?
2. Is there a separate migration repository or Supabase project configuration not included here?
3. Which of the listed external integrations (Google auth, production mail settings, Razorpay, storage buckets) are active in the deployed environment?
4. Is `npm run lint` expected to remain the supported lint command for the installed Next.js version? It was not run during this read-only onboarding.

## Onboarding conclusion

The application-level architecture and principal user workflows are sufficiently clear to investigate and make scoped frontend/server-action changes. Database-sensitive, authorization-sensitive, or payment changes should wait until the actual SQL/RLS/functions and intended production behavior are available.
