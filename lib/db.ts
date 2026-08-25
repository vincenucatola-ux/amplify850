import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

let client: Sql | null = null;

/**
 * Lazily creates the pooled Postgres client on first real use — never at
 * module import time. Route modules get imported during `next build` (to
 * collect route info) even for routes marked force-dynamic, so eagerly
 * reading DATABASE_URL at the top of this file would break the build on
 * any machine that doesn't have it set (e.g. CI, or before the DB exists).
 */
export function getSql(): Sql {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  client = postgres(url, {
    max: 1, // the connection string should already point at Neon/Supabase's pooler
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return client;
}

export const DAILY_SEND_CAP = Number(process.env.MAIL_DAILY_CAP ?? 85);

/**
 * Atomically reserves up to `want` sends against today's budget and returns
 * how many were actually granted (may be less than `want`, or 0). Safe under
 * concurrent invocations — the Vercel daily cron and the hourly GitHub Action
 * can both call this in the same minute without over-sending.
 */
export async function reserveSendBudget(want: number): Promise<number> {
  if (want <= 0) return 0;
  const sql = getSql();
  return sql.begin(async (tx) => {
    await tx`
      insert into send_budget (day, sent_count) values (current_date, 0)
      on conflict (day) do nothing
    `;
    const [{ sent_count }] = await tx<{ sent_count: number }[]>`
      select sent_count from send_budget where day = current_date for update
    `;
    const grant = Math.max(0, Math.min(want, DAILY_SEND_CAP - sent_count));
    if (grant > 0) {
      await tx`
        update send_budget set sent_count = sent_count + ${grant}
        where day = current_date
      `;
    }
    return grant;
  });
}
