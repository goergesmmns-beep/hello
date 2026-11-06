# Test the buyer engine

## On your computer
    npm install
    copy .env.example .env.local

Open `.env.local`, set `ADMIN_PASSWORD=test123`, then run:

    npm run dev

Open http://localhost:3000. Nothing is emailed here. Messages go to `.data/outbox.log`, and data goes to `.data/store.json`.

## Be the buyer
Use a phone-sized window or your phone. Use any test email.

| Test | Listing | Choose | What should happen |
| --- | --- | --- | --- |
| Automatic release | AI Content Intelligence Platform | Any route | NDA signed, then the CIM is ready. Use the "Test mode" button to open it. |
| Strategic company | Patented Sports and BBQ Brand | Company | Waits in advisor review. |
| Bank letter | Insurance agency | Bank or lender letter | Upload a PDF. Waits in advisor review. |
| No funding plan | EdTech CRM | Using financing, then "Not sure yet" | Goes to keep warm, with strategy session options. |

## Be the advisor
Open http://localhost:3000/admin in a second window and sign in. Open a buyer, read their documents, then press **Release CIM** or **Keep warm**. Go back to the buyer window and refresh. Open the test mode link to see the CIM with the buyer's email stamped on it.

## Try to break it
- Repeat a request with the same email. It should email the link and not reopen the record.
- Remove `?v=...` from the link. The CIM should stay locked.
- Upload a .txt file. It should be refused.

## Live test on westbound.dynarra.com
1. In Vercel, add these environment variables, then redeploy:
   - `NEXT_PUBLIC_SITE_URL=https://westbound.dynarra.com`
   - `DATABASE_URL` from a Postgres database (Vercel Storage > Neon)
   - `ADMIN_PASSWORD`, a long password
   - `SETTINGS_KEY`, `CRON_SECRET` and `INBOUND_SECRET`, long random strings
   - `TEST_MODE=true`
2. In Vercel, open Settings > Domains and add `westbound.dynarra.com`.
3. At your DNS provider, add the CNAME record Vercel shows you.
4. Open the site and run the tests above, using `/admin` for the advisor side.

`TEST_MODE=true` shows the emailed link on screen, needs no email account and keeps the test site out of search engines. Remove it before launch, and add `RESEND_API_KEY`, `MAIL_FROM` and `ADVISOR_EMAIL`.

## Connect Pipedrive
Sign in at `/admin/integrations`, paste the API token from Pipedrive (Personal preferences > API), then press **Create Buyer Access pipeline**. A free Pipedrive trial works for your own test. Run a buyer through and watch the deal move.

## Proof of funds, e-signature and broker tools

1. Pick an own-capital or lender-letter buyer. Sign the NDA by typing or drawing.
2. Upload documents, then review them at `/admin/funds`.
3. Verify and release, or use Request more to send the buyer back with a note.
4. Log offers and tasks on the buyer record. They roll up to `/admin/offers` and `/admin/tasks`.
5. See `/admin/ndas`, `/admin/reports` and each listing's Seller report.
