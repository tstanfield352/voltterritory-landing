// POST /api/waitlist — saves an early-access email to the D1 database
// bound as DB on the landing site's Cloudflare Pages project.
// The table is created on first use, so no migration step is needed.

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  if (!env.DB) {
    return json({ error: "The waitlist isn't connected yet." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot: real people never fill this hidden field; bots often do.
  // Pretend it worked so the bot moves on.
  if (body.company_url) return json({ ok: true });

  const email = String(body.email || "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS waitlist (
         email TEXT PRIMARY KEY,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         country TEXT,
         referrer TEXT
       )`
    ).run();
    await env.DB.prepare(
      "INSERT OR IGNORE INTO waitlist (email, country, referrer) VALUES (?, ?, ?)"
    )
      .bind(email, request.cf?.country || null, request.headers.get("Referer") || null)
      .run();
  } catch (err) {
    console.error(err);
    return json({ error: "Something went wrong on our end." }, 500);
  }

  return json({ ok: true });
}
