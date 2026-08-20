import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHead({
  eyebrow,
  heading,
}: {
  eyebrow?: string;
  heading: string;
}) {
  return (
    <div className="text-center max-w-[680px] mx-auto mb-10">
      {eyebrow && (
        <div className="uppercase tracking-[0.25em] text-gold font-bold text-xs mb-2.5">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.2rem)] text-maroon m-0">
        {heading}
      </h2>
    </div>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const base =
    "inline-block px-7 py-3 rounded font-semibold text-[0.95rem] tracking-wide transition-transform hover:-translate-y-0.5";
  const styles =
    variant === "primary"
      ? "bg-maroon text-cream hover:bg-maroon-light"
      : "bg-transparent text-maroon border-[1.5px] border-maroon hover:bg-maroon hover:text-cream";
  const isExternal = href.startsWith("http");
  return (
    <Link
      href={href}
      className={`${base} ${styles} ${className}`}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-cream border border-cream-dark rounded-lg p-7 shadow-[0_2px_10px_rgba(72,31,37,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block bg-tan text-maroon text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded mb-3">
      {children}
    </span>
  );
}
