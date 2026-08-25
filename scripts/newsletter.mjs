#!/usr/bin/env node
/**
 * Newsletter CLI. Run from the repo root.
 *
 *   node scripts/newsletter.mjs sync                    push all drafts to the site
 *   node scripts/newsletter.mjs preview <slug>          who would receive it
 *   node scripts/newsletter.mjs test <slug> <email>     send one copy to yourself
 *   node scripts/newsletter.mjs send <slug>             queue the real send
 *   node scripts/newsletter.mjs stats                   list health
 *
 * Reads SITE_URL and ADMIN_SECRET from the environment or .env.local.
 */

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content", "newsletters");

// --- env ---------------------------------------------------------------------

async function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const p = path.join(ROOT, file);
    if (!existsSync(p)) continue;
    const text = await readFile(p, "utf8");
    for (const line of text.split("\n")) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, "");
      if (!process.env[m[1]]) process.env[m[1]] = value;
    }
  }
}

// --- frontmatter -------------------------------------------------------------

/** Minimal `key: value` frontmatter. No nested structures, by design. */
function parseFrontmatter(raw) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw.replace(/\r\n/g, "\n"));
  if (!m) return { meta: {}, body: raw.trim() };

  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([a-zA-Z_]+):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    let value = kv[2].trim().replace(/^["']|["']$/g, "");
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    meta[kv[1]] = value;
  }
  return { meta, body: m[2].trim() };
}

// --- api ---------------------------------------------------------------------

function api(routePath, body) {
  const base = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) throw new Error("Set SITE_URL (or NEXT_PUBLIC_SITE_URL).");
  if (!process.env.ADMIN_SECRET) throw new Error("Set ADMIN_SECRET.");

  return fetch(`${base}${routePath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ADMIN_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(async (r) => {
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(json)}`);
    return json;
  });
}

// --- commands ----------------------------------------------------------------

async function readIssue(slug) {
  const file = path.join(CONTENT, `${slug}.md`);
  if (!existsSync(file)) throw new Error(`No such issue: content/newsletters/${slug}.md`);
  const { meta, body } = parseFrontmatter(await readFile(file, "utf8"));
  if (!meta.subject) throw new Error(`${slug}.md is missing a "subject:" in its frontmatter.`);
  return {
    slug,
    subject: meta.subject,
    preheader: meta.preheader ?? "",
    bodyMd: body,
    segments: Array.isArray(meta.segments) ? meta.segments : ["all"],
  };
}

async function sync() {
  const files = (await readdir(CONTENT)).filter((f) => f.endsWith(".md"));
  if (!files.length) return console.log("No issues found in content/newsletters/.");

  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    try {
      const issue = await readIssue(slug);
      const res = await api("/api/newsletter/issues", issue);
      console.log(`  synced  ${slug}  (${res.status})`);
    } catch (e) {
      const msg = String(e.message ?? e);
      if (msg.includes("already_sent")) console.log(`  skipped ${slug}  (already sent)`);
      else console.log(`  FAILED  ${slug}  ${msg}`);
    }
  }
}

async function main() {
  await loadEnv();
  const [cmd, a, b] = process.argv.slice(2);

  switch (cmd) {
    case "sync":
      return sync();

    case "preview": {
      if (!a) throw new Error("Usage: preview <slug>");
      await api("/api/newsletter/issues", await readIssue(a));
      const res = await api("/api/newsletter/send", { slug: a, dryRun: true });
      console.log(`\n  "${res.subject}"`);
      console.log(`  segments:   ${res.segments.join(", ")}`);
      console.log(`  recipients: ${res.recipients}`);
      console.log(`  will take:  ~${res.estimatedDays} day(s) at the current daily cap\n`);
      return;
    }

    case "test": {
      if (!a || !b) throw new Error("Usage: test <slug> <email>");
      await api("/api/newsletter/issues", await readIssue(a));
      const res = await api("/api/newsletter/send", { slug: a, testEmail: b });
      console.log(`  queued a test copy to ${b} (${res.queued}).`);
      console.log("  It goes out on the next queue drain — or trigger one now:");
      console.log(`    curl -H "Authorization: Bearer $CRON_SECRET" $SITE_URL/api/cron/drain`);
      return;
    }

    case "send": {
      if (!a) throw new Error("Usage: send <slug>");
      const issue = await readIssue(a);
      await api("/api/newsletter/issues", issue);
      const dry = await api("/api/newsletter/send", { slug: a, dryRun: true });

      console.log(`\n  About to queue "${dry.subject}" to ${dry.recipients} people.`);
      console.log("  This cannot be undone once the first batch goes out.");
      process.stdout.write("  Type the slug to confirm: ");

      const answer = await new Promise((resolve) => {
        process.stdin.once("data", (d) => resolve(d.toString().trim()));
      });
      if (answer !== a) {
        console.log("  Cancelled.");
        process.exit(0);
      }

      const res = await api("/api/newsletter/send", { slug: a });
      console.log(`\n  Queued ${res.recipients}. Draining over ~${res.estimatedDays} day(s).\n`);
      process.exit(0);
    }

    default:
      console.log(`
  node scripts/newsletter.mjs sync                 push drafts to the site
  node scripts/newsletter.mjs preview <slug>       recipient count, no send
  node scripts/newsletter.mjs test <slug> <email>  one copy to yourself
  node scripts/newsletter.mjs send <slug>          queue the real send
`);
  }
}

main().catch((e) => {
  console.error(`\n  ${e.message ?? e}\n`);
  process.exit(1);
});
