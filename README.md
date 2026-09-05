# कागज के हो? — Kagaj K Ho?

**Nepal's citizen procedure and government-service guide.**

An independent, bilingual (नेपाली / English) information platform that explains, in
plain language, which documents you need for a government service in Nepal, what the
steps are, where to go, and — critically — **where that information came from and when
it was last checked**.

> **Kagaj K Ho? is an independent information platform. It is not a government website
> and does not represent any government office. Requirements, fees, office locations and
> procedures can change. Always confirm important details with the official source before
> visiting an office or making a payment.**

---

## The product principle

This project competes on **trust**, not on coverage. Three rules are enforced in code,
not just in policy:

1. **Nothing is published without a source.** `lib/content/validate.ts` blocks
   publication if any claim marked *officially stated* has no attached source URL, or if
   the record has no `lastVerifiedAt` and no scheduled review date. The admin Publish
   button is disabled until it passes, and `npm run validate:content` re-runs the same
   gate in CI.
2. **"We don't know" is a valid answer.** Every fee, document, step and processing time
   carries a `ClaimBasis` — `OFFICIALLY_STATED`, `DERIVED`, `ESTIMATED`, `USER_REPORTED`
   or `UNKNOWN` — rendered as a visible tag. An unverified fee renders as
   *"Not verified — check the official source"*, never as a number.
3. **Stale content cannot look current.** `resolveVerificationStatus()` automatically
   degrades a 🟢 badge to 🟡 the moment its review date passes, regardless of what the
   database says.

Rule 2 is not theoretical. The passport fee was initially recorded as *unverified*
because the Department of Passports process page states no amount and its fee page was
returning HTTP 502. It was only added once that page could be read and its caption
confirmed as the department's own rate table — and the record still carries the hedge
the source itself uses ("the rates that *generally* apply"). Tests assert that an
unverified fee can never carry a number, on any procedure.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Server-rendered, indexable procedure pages with minimal client JS |
| Styling | Tailwind CSS | Mobile-first; no runtime CSS cost |
| Database | PostgreSQL + Prisma | Relational integrity for the source/claim graph |
| Search | Postgres `pg_trgm` trigram similarity | Script-agnostic — the only approach that handles Devanagari, English and romanised Nepali in one index |
| Auth | `jose` HS256 cookie sessions + bcrypt | No external identity dependency for a 4-person editorial team |
| Tests | Vitest (unit + integration) and Playwright (e2e) | |

**Why trigram search and not Postgres full-text?** Postgres ships no text-search
configuration for Devanagari, so `to_tsvector` would not stem or tokenise Nepali
usefully. Trigram similarity over a normalized `searchText` blob works on any script and
tolerates the misspelled romanisations people actually type ("pasport", "janma darta").
The architecture stays swappable: `lib/search/search.ts` is the single seam to replace
with Meilisearch or Typesense later.

---

## Getting started

### Prerequisites

- Node.js 20+ (developed on 22)
- PostgreSQL 14+ with the `pg_trgm` and `unaccent` extensions available

### Setup

```bash
git clone <this repo>
cd kagaj-k-ho
npm install

cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and ADMIN_SESSION_SECRET.
# Generate a secret with: openssl rand -base64 48

createdb kagaj_k_ho          # or use a managed Postgres instance
npx prisma migrate deploy    # applies migrations and creates the extensions
npm run db:seed              # seeds fact-checked content + a bootstrap admin

npm run dev                  # http://localhost:3000
```

The site redirects `/` to `/ne`. The admin panel is at `/admin` — sign in with the
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from your `.env`, then change that password.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | yes in production | Canonical URLs, `sitemap.xml`, Open Graph tags |
| `ADMIN_SESSION_SECRET` | yes | Signs admin session cookies and CSRF tokens. Must be ≥ 32 chars |
| `SEED_ADMIN_EMAIL` | seed only | Bootstrap admin account |
| `SEED_ADMIN_PASSWORD` | seed only | Bootstrap admin password. The seed refuses the placeholder value in production |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | no | `"true"` enables the anonymous event beacon. Defaults off |
| `ANTHROPIC_API_KEY` | no | Reserved for the AI layer. Unset is fine — see *AI features* below |

Never commit `.env`. It is gitignored.

---

## Commands

```bash
npm run dev              # development server
npm run build            # prisma generate + next build
npm start                # production server

npm run typecheck        # tsc --noEmit
npm run lint             # eslint
npm test                 # vitest: unit + integration (needs a seeded database)
npm run test:e2e         # playwright (needs a build; starts its own server)

npm run db:migrate       # create/apply a migration in development
npm run db:deploy        # apply migrations in production
npm run db:seed          # (re)seed fact-checked content — idempotent

npm run validate:content # re-run the publication gate over the live database
npm run check:sources    # fetch every source URL, record HTTP status + content hash
```

`check:sources` is the drift detector: it stores a SHA-256 of each source page's text
and reports which pages changed since the last snapshot. Run it on a schedule; changed
and failing sources surface in **Admin → Outdated queue**.

---

## Routes

### Public (both `/ne/…` and `/en/…`)

| Route | Description |
|---|---|
| `/` | Redirects to the preferred locale |
| `/{locale}` | Homepage: search, quick categories, popular, most searched, recently verified, life events, trust explainer |
| `/{locale}/services` | All published procedures |
| `/{locale}/services/{slug}` | Procedure detail — the main page |
| `/{locale}/services/{slug}/opengraph-image` | Generated social share card |
| `/{locale}/categories`, `/{locale}/categories/{slug}` | Category browsing |
| `/{locale}/life-events`, `/{locale}/life-events/{slug}` | Life-event browsing |
| `/{locale}/search?q=` | Search results (noindex) |
| `/{locale}/methodology` | Fact-check method and badge legend |
| `/{locale}/disclaimer` | About and disclaimer |
| `/{locale}/privacy` | What we collect and, more importantly, what we don't |
| `/{locale}/faq` | Site-wide FAQ (emits `FAQPage` schema) |
| `/sitemap.xml`, `/robots.txt` | Generated |

### API

| Route | Description |
|---|---|
| `GET /api/search?q=&limit=` | Autocomplete. Rate limited |
| `POST /api/reports` | Report outdated information. Rate limited, schema-validated |
| `POST /api/analytics` | Anonymous event sink with a strict props allow-list |
| `GET /api/checklist/{slug}?locale=` | Downloadable plain-text document checklist |
| `POST /api/ai/ask` | Retrieval over verified content only |

### Admin (`/admin`, noindex, session-gated)

Dashboard · Procedures · Procedure editor · Outdated queue · Sources · Reports · Audit log

---

## Seeded content and the sources behind it

The seed contains **only what could be verified from a primary official source on
2026-09-05 (Asia/Kathmandu)**.

### Published (🟢 verified)

| Procedure | Official source |
|---|---|
| **Applying for an e-passport from within Nepal** (`/services/e-passport`) | Department of Passports — [*When applying for a passport in Nepal*](https://nepalpassport.gov.np/en/process/process-23) (documents, steps), [*राहदानीका लागि लाग्ने दस्तुर*](https://nepalpassport.gov.np/process/-41) (fee table), [*Online Payment*](https://nepalpassport.gov.np/online-payment) (expedited-only caveat) and the [department homepage](https://nepalpassport.gov.np/en) (office address, phone, hours, lost/stolen advisory) |
| **Registering for the National Identity Card** (`/services/national-id-card`) | Department of National ID and Civil Registration — [FAQ: राष्ट्रिय परिचयपत्र](https://donidcr.gov.np/pages/abboyed-asked-questions--rational-identity-10/) and the [department homepage](https://donidcr.gov.np/) |
| **Birth registration** (`/services/birth-registration`) | Department of National ID and Civil Registration — [FAQ: पञ्जीकरण](https://donidcr.gov.np/pages/about-frequently-asked-questions--registration-5/), with [राष्ट्रिय परिचयपत्र तथा पञ्जीकरण नियमावली, २०७७](https://donidcr.gov.np/content/19/national-identity-card-and-registration-regulations--2077/) cited as the governing regulation |

What *is* asserted, because the sources state it: the Department of Passports fee
schedule (NPR 12,000 / 20,000 for a new or renewed 34- / 66-page passport, NPR 9,500 /
14,500 for minors under 10, more for lost or damaged, free where the office made the
error); the National ID card is free and a duplicate costs NPR 500 through Nepal Rastra
Bank; personal events registered within 35 days are free and attract a late fee after
that.

What is deliberately **absent**:

- **No processing times** for any of the three. None of the sources state one, so all
  three render "Not verified — check the official source".
- **No single machine-readable price** in the passport page's `HowTo` JSON-LD. Where a
  procedure publishes a schedule of alternatives, any one number would misrepresent it,
  so structured data carries no price rather than a wrong one.
- **No District Administration Office fee.** The department's online-payment page
  distinguishes expedited from regular service but publishes no separate DAO rate; the
  record notes the distinction instead of inventing an amount.

### Unpublished (drafts awaiting fact-check)

PAN registration, driving licence, citizenship certificate and company registration are
seeded as `SOURCE_ATTACHED` — the agency's official landing page is on file, but **no
requirement, fee or step is asserted**, and they are invisible to the public site. They
exist so an editor can pick the research up where it stopped. The Office of the Company
Registrar was returning HTTP 503 during research; `npm run check:sources` still reports it.

Also seeded: 15 categories, 11 life events, 13 reusable document definitions, 2 offices
with published hours, 4 site-wide FAQs.

---

## Editorial workflow

```
Draft → Source attached → Fact checked → In review → Published → (scheduled review) → Re-verified
```

Publishing requires the `EDITOR` role and a passing validation gate. Recording a
fact-check writes a `VerificationRecord` and moves `lastVerifiedAt` / `nextReviewAt`
atomically — the badge on the public page is always backed by an auditable event.
Publishing also snapshots the full record into `ProcedureVersion` (version history).
Every content mutation writes an `AuditLog` row with a shallow before/after diff.

Roles: `OWNER` > `EDITOR` (may publish and verify) > `CONTRIBUTOR` (may draft and attach
sources) > `VIEWER`.

---

## AI features

The AI layer is **retrieval over verified content, not generation of facts**.
`POST /api/ai/ask` resolves a question to a published procedure through the same search
index the site uses, then assembles the answer **only from stored database columns** in
`lib/ai/answer.ts`. There is no code path by which a model can add a requirement that is
not in the record. Every answer returns the source list and the verification date, and
when nothing matches it says so and points at the official Nepal Government portal
rather than guessing.

`ANTHROPIC_API_KEY` is reserved for a future language-simplification/translation pass
over already-retrieved content. With it unset, the endpoint is fully functional and
purely deterministic.

---

## Security and privacy

- bcrypt password hashing (cost 12); constant-time comparison on unknown accounts
- HS256 session cookies — `httpOnly`, `sameSite=lax`, `secure` in production
- Middleware verifies the session signature; every page and action re-checks the account
  server-side so a deactivated admin loses access immediately
- Role-based access enforced in every server action
- HMAC double-submit CSRF tokens for non-action POST routes; Server Actions carry
  Next.js's own origin checks
- Zod validation with strict schemas on every public endpoint (unknown keys are stripped)
- Rate limiting on search, reports, analytics, AI and login
- Prisma parameterised queries throughout; the one raw SQL query uses `Prisma.sql` bindings
- CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, Referrer-Policy and
  Permissions-Policy set in `next.config.ts`
- **No PII by design**: no document upload, no citizenship/passport/NID numbers, no
  payments, and search queries are never persisted. IPs are stored only as a salted,
  truncated, irreversible hash for abuse limiting

---

## Accessibility and performance

Semantic landmarks, a skip link, an ARIA combobox with full keyboard navigation for
search, labelled form controls, `aria-current` on the active locale, table captions,
visible focus rings, and `prefers-reduced-motion` support. Devanagari gets extra line
height so matras stay legible.

Content pages are server-rendered and cached (`revalidate = 300`); the only client
components are search, the report form, the language switcher and the checklist buttons.
No web fonts are fetched on the critical path.

---

## Monetization architecture

`SponsorSlot` is structurally isolated from procedure content: the component reads only
that table and *cannot* render a fee, document or step. Every placement carries a visible
"प्रायोजित / Sponsored" label and `rel="sponsored nofollow"`. Nothing is enabled by
default. **Sponsors can never alter a factual government requirement** — that is enforced
by the schema, not by policy.

---

## Deployment

Vercel-compatible. Point it at a managed PostgreSQL instance (Neon, Supabase, RDS) that
allows `CREATE EXTENSION pg_trgm`.

1. Set `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` and `ADMIN_SESSION_SECRET` as environment
   variables.
2. Build command: `npm run build` (runs `prisma generate`).
3. Run `npx prisma migrate deploy` as a release step before the first boot.
4. Run `npm run db:seed` once to create the bootstrap admin, then change the password.
5. Schedule `npm run check:sources` (cron or a scheduled GitHub Action) — weekly is a
   reasonable starting cadence.

`.github/workflows/ci.yml` runs typecheck, lint, unit + integration tests, the content
validation gate, a production build and the Playwright suite against a Postgres service
container.

---

## Testing

82 unit/integration tests and 38 end-to-end tests (desktop + mobile viewports).

```bash
npm test          # vitest — needs a migrated, seeded database
npm run test:e2e  # playwright — needs `npm run build` first
```

End-to-end coverage maps to the journeys that matter: search → procedure → official
source (English, Nepali and romanised Nepali), reporting outdated information, admin edit
→ audit log entry, the publication gate refusing an unsourced record, language switching,
canonical/hreflang tags and structured data.

The integration suite asserts product invariants rather than implementation details: no
officially-stated claim without a source, no published procedure without a verification
record, every primary source on a `.gov.np` host, no unverified fee rendered as a
number, and every passport fee amount traceable to the official fee page.

> On a machine whose preinstalled Chromium build does not match this Playwright release,
> set `PLAYWRIGHT_CHROMIUM_PATH` to the browser binary instead of downloading a second one.

---

## Known limitations

- **Coverage is three procedures.** That is the point — the remaining categories are
  seeded as unpublished drafts rather than filled with plausible-sounding invention.
  The blockers are documented per record in `prisma/seed-procedures.ts`: the Office of
  the Company Registrar and the Department of Transport Management sites were
  unreachable, and the Inland Revenue Department's PAN registration page
  (`/content/6035/`) serves a title and a publication date but an **empty body** — the
  procedure text visible in search-engine snippets is not in the page the server
  currently returns. None of that is enough to publish from.
- **Rate limiting is process-local** (in-memory fixed window). Correct for a single
  instance; a multi-instance deployment should swap `lib/rate-limit.ts` for Redis/Upstash.
- **Search ranking is not personalised or typo-tolerant beyond trigrams.** Queries under
  three characters fall back to prefix matching only.
- **Search-result badges are approximate.** The search projection omits `nextReviewAt`,
  so the staleness downgrade is applied on the detail page, not in result rows.
- **No transactional email.** Report submitters who leave an address are not yet
  contacted automatically.
- **The BS calendar** comes from `nepali-date-converter`; conversions were spot-checked
  against known anchors (2000-01-01 = 2056 Poush 17, 2020-04-13 = 2077 Baisakh 1,
  2023-04-14 = 2080 Baisakh 1) in `tests/unit/dates.test.ts`.
- **`prisma migrate dev` warns** that the `package.json#prisma` key is deprecated. Moving
  to `prisma.config.ts` is a small follow-up.
- **No PWA manifest / service worker yet.** The architecture is ready for one (static
  content pages, no critical client state), but offline caching of government content
  needs a staleness policy designed first — a cached page that looks current would
  violate the product's core rule.

---

## Next recommended features

1. **Finish the fact-check backlog** — PAN, driving licence, citizenship and company
   registration, using the admin workflow already built. All four are currently blocked
   on the source side rather than on tooling; a headless-browser fetch step in
   `check:sources` would help with the JS-rendered agency pages.
2. **Automated drift alerts** — `check:sources` already detects content-hash changes;
   wire it to email or Slack so an editor is told the day a ministry page changes.
3. **District/local-government layer** — fees and offices vary by palika; the `Office`
   and `OfficeHour` tables are modelled for it but no local sources are seeded yet.
4. **Offline-first PWA** with an explicit "you are viewing a cached page from <date>"
   banner, so caching never conflicts with the staleness rule.
5. **Source snapshot diffing in the admin UI** — show the editor exactly which sentence
   changed since the last verification, rather than just that something did.
6. **Meilisearch/Typesense** behind the existing `lib/search` seam once the corpus
   outgrows trigram scans.
7. **Public "content gap" page** driven by zero-result searches, so readers can see what
   is being worked on.

---

## Licence

Not yet specified. All content is independently compiled; official source material
remains the property of the respective Government of Nepal agencies.
