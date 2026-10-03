# Skavyra

The Skavyra website and the three panels behind it: a student area, a counsellor
panel and an admin panel. Next.js 15 (App Router) with TypeScript, Tailwind and
Supabase.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

`.env.local` already has the project URL and the anon key filled in, so the
site, sign up, log in and the student area work straight away.

## Environment variables

| Variable | Needed for | Already set |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | everything | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | everything | yes |
| `NEXT_PUBLIC_SITE_URL` | email links, certificate verify links | yes, `http://localhost:3000` |

The Next.js app never holds the Supabase service role key — every request
runs as the signed-in user (or anon) under RLS. A few cases that would
otherwise need broader access go through `security definer` SQL functions
instead, each scoped to exactly what it returns or writes:

- the contact form and "request a call" button call `submit_contact_lead()`
- the certificate verification page at `/verify` calls `verify_certificate()`
- signed URLs for lesson videos and downloads (`/api/lesson-url`) are issued
  under a storage policy that checks the viewer's own enrolment
- verifying an offline payment calls `apply_payment()`, which checks the
  caller is an admin
- the duplicate-lead-owner message calls `find_lead_owner()`, staff only

Creating an employee/student login and deactivating staff still go through
the `create-user` / `deactivate-staff` edge functions in
`supabase/functions/`, which hold their own service role key inside Supabase,
separate from this app.

## Database

`supabase/skavyra_backend_full.sql` is the schema this frontend was built
against. Run it once in the SQL editor if the project is empty.

### Course page content migration

For an existing database, run
`supabase/migrations/202610040001_course_page_content.sql` in the Supabase SQL
editor before saving the expanded course form. It adds five nullable text
columns without changing existing content or access policies.

In **Admin → Courses → Details**, enter learning outcomes, audience groups,
prerequisites, and projects one per line. The mentor biography accepts paragraphs.
These fields are optional; empty sections and their navigation links are hidden
on the public course page. The existing description is now labelled **Course
overview**, with its saved content preserved. Modules and lessons still supply
the curriculum, and photos are managed in **Images**.

Courses can be published with details alone. Modules and lessons are optional
and may be added later; the public page hides the curriculum until published
lessons are available.

### Admin deletion and storage updates

After the base schema is installed, run these SQL migrations in order:

1. `supabase/migrations/202610040002_course_delete_and_storage.sql`
2. `supabase/migrations/202610040003_remove_employee.sql`
3. `supabase/migrations/202610040004_disable_profile_avatars.sql`

The course editor includes **Delete**. Courses with enrollments are protected;
unpublish those instead. Course deletion cascades to modules and lessons but
does not delete uploaded storage files.

The Employees table includes **Remove** for non-admin employees. It removes the
staff record and employee role in one audited transaction, reassigning open
leads or leaving them unassigned. Auth accounts, profiles, other roles, and
historical records remain. Admin accounts and self-removal are blocked. This
uses a database RPC and does not require a new Edge Function deployment.

Profile-photo uploads have been removed. Account menus show initials. The
avatar retirement migration removes the earlier avatar policies and makes an
existing `avatars` bucket private without deleting files. It also works when
the avatar setup was never applied. Course covers and mentor photos remain.
Published preview lessons can receive signed storage URLs for visitors;
other lesson files remain private.

To inspect deployed policies, bucket settings, grants, and the enrollment
foreign keys, run `supabase/diagnostics/storage_and_delete_access.sql`.

### Making yourself an admin

Sign up through the website, then run this with your email:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'you@example.com'
on conflict do nothing;

insert into public.employees (id, is_active, employment_type)
select id, true, 'full_time' from auth.users where email = 'you@example.com'
on conflict (id) do nothing;
```

Log out and back in, and `/admin` opens.

## Edge functions

Four functions live in `supabase/functions`. Deploy them with the Supabase CLI:

```bash
supabase functions deploy create-user
supabase functions deploy deactivate-staff
supabase functions deploy simulate-payment
supabase functions deploy razorpay-webhook --no-verify-jwt
```

`create-user` and `deactivate-staff` back the admin's Employees screen.
`simulate-payment` records a payment while the real gateway is off.
`razorpay-webhook` is ready for when Razorpay goes live; point the webhook at it
and set `RAZORPAY_WEBHOOK_SECRET` in the function's environment.

## How it is laid out

```
src/app/(marketing)   the public website
src/app/(auth)        log in, sign up, password reset
src/app/dashboard     the student area
src/app/employee      the counsellor panel
src/app/admin         the admin panel
src/actions           server actions, one file per area
src/lib               supabase clients, validation, excel and pdf helpers
src/components        ui primitives, then one folder per area
```

`middleware.ts` refreshes the session and keeps each role in its own panel: a
student who opens `/admin` is sent back to `/dashboard`.

## Decisions worth knowing

- **The student area is `/dashboard`**, to sit alongside `/employee` and
  `/admin`. It is not `/learn`.
- **"For colleges" in the header** goes to `/contact?topic=college` rather than
  its own page, so college enquiries land in the same lead list with a topic
  attached.
- **Testimonials are switched off.** `TESTIMONIALS` in `src/lib/content.ts` is
  an empty array and the section hides itself. Add real, consented quotes and it
  appears.
- **Payments are simulated.** The Pay button says so plainly and records the
  payment through the edge function. Nothing charges a card.
- **Spreadsheet reading uses the `xlsx` npm package**, not the CDN build. If you
  later prefer the CDN copy the vendor recommends, swap the import in
  `src/lib/excel/parse.ts`.
- **Account menus show initials.** Profile-photo uploads are not supported.

## Checks

```bash
npx tsc --noEmit   # types
npm run lint       # eslint
npm run build      # production build
```
