import { createHash, randomBytes } from "node:crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SEGMENTS = ["fsu_student", "lcs_family", "community", "business"] as const;
export type Segment = (typeof SEGMENTS)[number];

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.trim().length <= 254 && EMAIL_RE.test(email.trim());
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidSegment(segment: unknown): segment is Segment {
  return typeof segment === "string" && (SEGMENTS as readonly string[]).includes(segment);
}

/** Segments an issue can target: any subscriber segment, plus "all". */
export function isValidIssueSegment(segment: unknown): segment is Segment | "all" {
  return segment === "all" || isValidSegment(segment);
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT is not set.");
  return createHash("sha256").update(`${ip}${salt}`).digest("hex");
}

export function getClientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "0.0.0.0";
}

/**
 * Minimal signup fraud checks: a honeypot field a real visitor never fills
 * in, and a minimum time-on-form (scripted submissions arrive in
 * milliseconds; nobody types an email address that fast).
 */
export function looksLikeBot(input: { honeypot?: unknown; renderedAt?: unknown }): boolean {
  if (typeof input.honeypot === "string" && input.honeypot.trim() !== "") return true;
  const renderedAt = Number(input.renderedAt);
  if (!Number.isFinite(renderedAt) || renderedAt <= 0) return true;
  const elapsed = Date.now() - renderedAt;
  return elapsed < 1500;
}

export function randomToken(): string {
  return randomBytes(32).toString("hex");
}

/** Shared bearer-token check for admin (CLI) and cron routes. */
export function isAuthorized(request: Request, envVar: "ADMIN_SECRET" | "CRON_SECRET"): boolean {
  const secret = process.env[envVar];
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
