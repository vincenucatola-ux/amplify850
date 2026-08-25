import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: Request) {
  const sql = getSql();
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return redirectTo(request, "/newsletter/confirmed?ok=0&reason=missing");

  const [subscriber] = await sql<
    { id: string; status: string; confirm_token_expires: string | null }[]
  >`select id, status, confirm_token_expires from subscribers where confirm_token = ${token}`;

  if (!subscriber) return redirectTo(request, "/newsletter/confirmed?ok=0&reason=invalid");

  if (subscriber.status === "confirmed") {
    return redirectTo(request, "/newsletter/confirmed?ok=1&already=1");
  }

  if (
    subscriber.confirm_token_expires &&
    new Date(subscriber.confirm_token_expires).getTime() < Date.now()
  ) {
    return redirectTo(request, "/newsletter/confirmed?ok=0&reason=expired");
  }

  await sql`
    update subscribers set
      status = 'confirmed',
      confirmed_at = now(),
      confirm_token = null,
      confirm_token_expires = null
    where id = ${subscriber.id}
  `;
  await sql`insert into events (subscriber_id, type) values (${subscriber.id}, 'confirm')`;

  return redirectTo(request, "/newsletter/confirmed?ok=1");
}
