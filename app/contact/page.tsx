"use client";

import { useState } from "react";
import { web3forms, contact, site } from "@/content";
import { SectionHead } from "@/components/ui";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", web3forms.accessKey);
    formData.append("subject", `New message from ${site.name} site`);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const keyMissing = web3forms.accessKey === "YOUR_WEB3FORMS_ACCESS_KEY_HERE";

  return (
    <section className="px-6 py-16">
      <SectionHead eyebrow="Get in Touch" heading="Contact Us" />
      <div className="max-w-[560px] mx-auto bg-cream-dark rounded-xl p-8">
        {keyMissing && (
          <p className="mb-5 text-sm text-maroon bg-tan/40 border border-tan rounded p-3">
            This form needs a Web3Forms access key — add yours to{" "}
            <code>web3forms.accessKey</code> in content.ts (get one free at{" "}
            web3forms.com) to make it live.
          </p>
        )}
        {status === "sent" ? (
          <p className="text-maroon font-medium text-center py-8">
            Thanks — your message has been sent. We&rsquo;ll get back to you
            soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your name"
              required
              className="w-full rounded border border-tan bg-cream px-4 py-2.5 outline-none focus:border-maroon"
            />
            <input
              type="email"
              name="email"
              placeholder="Your email"
              required
              className="w-full rounded border border-tan bg-cream px-4 py-2.5 outline-none focus:border-maroon"
            />
            <textarea
              name="message"
              placeholder="Your message"
              required
              rows={5}
              className="w-full rounded border border-tan bg-cream px-4 py-2.5 outline-none focus:border-maroon"
            />
            <button
              type="submit"
              disabled={status === "sending" || keyMissing}
              className="bg-maroon text-cream font-semibold rounded px-6 py-3 hover:bg-maroon-light transition-colors disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send Message"}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-700">
                Something went wrong — please try again.
              </p>
            )}
          </form>
        )}
        {contact.email && (
          <p className="text-sm text-ink/70 text-center mt-6">
            Or email us directly at {contact.email}
          </p>
        )}
      </div>
    </section>
  );
}
