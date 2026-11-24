# VoltTerritory Landing

The public "coming soon" page for www.voltterritory.com, with an early-access
waitlist. Kept separate from the VoltTerritory dashboard until the full site
is ready.

## Layout

- `public/` — the page itself (plain HTML, no build step)
- `functions/api/waitlist.js` — saves waitlist emails to a D1 database

## Deploy (Cloudflare Pages)

1. Push this repo to GitHub.
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → this repo.
   Build command: none. Output directory: `public`.
3. D1 → create a database (e.g. `voltterritory-waitlist`). In the Pages
   project → Settings → Bindings, add it as **`DB`** (Production and Preview).
4. Pages project → Custom domains → add `www.voltterritory.com` and
   `voltterritory.com`.

## See signups

D1 → your database → Console:

```sql
SELECT * FROM waitlist ORDER BY created_at DESC;
```
