"use client";

import Link from "next/link";
import { useState } from "react";
import { nav, site } from "@/content";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream border-b border-cream-dark">
      <nav className="relative max-w-[1100px] mx-auto flex items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="font-display text-lg tracking-wide font-bold text-maroon"
        >
          {site.name.toUpperCase()}
        </Link>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden flex flex-col gap-1.5 p-2"
        >
          <span className="block w-6 h-0.5 bg-maroon" />
          <span className="block w-6 h-0.5 bg-maroon" />
          <span className="block w-6 h-0.5 bg-maroon" />
        </button>

        <ul
          className={`${
            open ? "flex" : "hidden"
          } sm:flex flex-col sm:flex-row gap-0 sm:gap-7 absolute sm:static top-full left-0 right-0 bg-cream border-b sm:border-0 border-cream-dark list-none m-0 p-0`}
        >
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-6 sm:px-0 py-3.5 sm:py-0 border-t sm:border-0 border-cream-dark text-ink font-medium text-[0.95rem] tracking-wide hover:text-gold transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
