"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./NewsletterForm.module.css";

const SEGMENTS = [
  { value: "community", label: "Community supporter" },
  { value: "fsu_student", label: "FSU student" },
  { value: "lcs_family", label: "Leon County parent, teacher, or staff" },
  { value: "business", label: "Business or partner" },
];

type Variant = "footer" | "block";

export interface NewsletterFormProps {
  /** `footer` is email-only and compact. `block` asks for a segment too. */
  variant?: Variant;
  /** Where on the site this form lives — stored with the signup. */
  source?: "footer" | "events" | "donate" | "about" | "join" | "conference" | "newsletter" | "home";
  heading?: string;
  blurb?: string;
}

type State = "idle" | "sending" | "done" | "error";

export default function NewsletterForm({
  variant = "footer",
  source = "footer",
  heading = "The monthly from Amplify 850",
  blurb = "What we raised, what's next, and where the money actually went. Once a month.",
}: NewsletterFormProps) {
  const id = useId();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const renderedAt = useRef<number>(0);

  // Stamped on the client so the server can reject submissions that arrived
  // faster than a person could type. Set in an effect to stay SSR-safe.
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;

    const form = new FormData(e.currentTarget);
    setState("sending");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          segment: form.get("segment") ?? "community",
          ageConfirmed: form.get("ageConfirmed") === "on",
          source,
          website: form.get("website") ?? "",
          renderedAt: renderedAt.current,
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };

      if (data.ok) {
        setState("done");
        setMessage(data.message ?? "Check your inbox for a confirmation link.");
      } else {
        setState("error");
        setMessage(data.message ?? "Something went wrong. Try again?");
      }
    } catch {
      setState("error");
      setMessage("Couldn't reach the server. Try again in a moment.");
    }
  }

  if (state === "done") {
    return (
      <div className={`${styles.root} ${styles[variant]}`} data-state="done">
        <p className={styles.success} role="status">
          {message}
        </p>
        <p className={styles.fine}>
          No email? Check spam, and add news@amplify850.org to your contacts.
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${styles[variant]}`}>
      {variant === "block" && (
        <>
          <h2 className={styles.heading}>{heading}</h2>
          <p className={styles.blurb}>{blurb}</p>
        </>
      )}

      <form onSubmit={onSubmit} noValidate>
        {/* Honeypot: positioned off-screen rather than display:none, which some
            bots detect. Never focusable, never announced. */}
        <div className={styles.hp} aria-hidden="true">
          <label htmlFor={`${id}-website`}>Website</label>
          <input
            id={`${id}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className={styles.row}>
          <label className={styles.srOnly} htmlFor={`${id}-email`}>
            Email address
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={styles.input}
            disabled={state === "sending"}
          />

          {variant === "footer" && (
            <button type="submit" className={styles.button} disabled={state === "sending"}>
              {state === "sending" ? "…" : "Subscribe"}
            </button>
          )}
        </div>

        {variant === "block" && (
          <>
            <label className={styles.label} htmlFor={`${id}-segment`}>
              I am a…
            </label>
            <select
              id={`${id}-segment`}
              name="segment"
              className={styles.select}
              defaultValue="community"
              disabled={state === "sending"}
            >
              {SEGMENTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <label className={styles.check}>
              <input type="checkbox" name="ageConfirmed" required />
              <span>
                I'm 18 or older. <span className={styles.fine}>
                  Students under 18 — ask a parent, or your school's faculty sponsor.
                </span>
              </span>
            </label>

            <button type="submit" className={styles.button} disabled={state === "sending"}>
              {state === "sending" ? "Subscribing…" : "Subscribe"}
            </button>
          </>
        )}

        {/* The compact footer variant carries the age affirmation as a notice
            rather than a checkbox. That's a deliberate tradeoff — if you restyle
            this, keep the sentence visible above the fold of the form. */}
        {variant === "footer" && (
          <input type="hidden" name="ageConfirmed" value="on" />
        )}

        {state === "error" && (
          <p className={styles.error} role="alert">
            {message}
          </p>
        )}

        <p className={styles.fine}>
          {variant === "footer"
            ? "By subscribing you confirm you're 18 or older. One email a month, unsubscribe any time."
            : "One email a month. Unsubscribe any time, one click."}
        </p>
      </form>
    </div>
  );
}
