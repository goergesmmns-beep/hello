# Westbound Road

Next.js site with the buyer access system built in. Hosted on Vercel.

## Run locally
    npm install
    cp .env.example .env.local   # set ADMIN_PASSWORD at least
    npm run dev

Without a database or email key, local data goes to `.data/` and emails go to `.data/outbox.log`.

## Deploy on Vercel
1. Push this folder to a private GitHub repo and import it in Vercel.
2. Add a Postgres database (Neon from the Vercel Marketplace works) so DATABASE_URL is set. Tables are created on first use.
3. Create a Resend account, verify the sending domain and add RESEND_API_KEY and MAIL_FROM.
4. Add the other values from `.env.example`. Use long random strings for ADMIN_PASSWORD, CRON_SECRET and INBOUND_SECRET.
5. Deploy, test on the Vercel URL, then point the domain. Old .html addresses redirect automatically.

## Before going live
- `content/nda.ts`: replace the draft with the counsel-approved NDA, then set NDA_APPROVED=true.
- `private/cims/<listing-slug>.pdf`: add each real CIM. Keep the repo private. Each file is stamped with the buyer's email when opened.
- `content/listings.ts`: confirm prices, `gate` and `floorUsd` for each listing.
- `lib/parse-lead.ts`: test against a real BizBuySell lead email.
- Pipedrive: create the pipeline stages and custom fields, then set PIPEDRIVE_STAGE_IDS and PIPEDRIVE_FIELD_KEYS.

## Marketplace leads
Forward BizBuySell lead emails with Zapier, Make or an inbound-email service to `POST /api/inbound/lead`, with header `x-inbound-secret` and JSON `{ "subject": "...", "text": "..." }`.

## Advisor desk
`/admin`, signed in with ADMIN_PASSWORD. Advisors review buyers, open documents, release the CIM or move a buyer to keep warm.

## Listing rule
`gate: "after_nda"` opens the CIM after the NDA and profile. `gate: "after_review"` waits for an advisor. The CIM only opens from the emailed link, which proves the buyer owns the address.

## Limits
Vercel caps uploads through a function at about 4.5 MB, so buyer uploads are limited to 4 MB. Uploaded proof documents are deleted after RETENTION_DAYS by the daily cron. Signed NDAs are kept.
