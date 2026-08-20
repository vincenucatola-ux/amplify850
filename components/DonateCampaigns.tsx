"use client";

import { useEffect, useState } from "react";

type Campaign = {
  key: string;
  label: string;
  zeffyUrl: string;
  embedSrc: string;
};

export function DonateCampaigns({ campaigns }: { campaigns: Campaign[] }) {
  const [selectedKey, setSelectedKey] = useState(campaigns[0].key);

  // Lets home page buttons deep-link straight to a campaign, e.g. /donate#masterclass
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (campaigns.some((c) => c.key === hash)) {
      setSelectedKey(hash);
    }
  }, [campaigns]);

  const selected = campaigns.find((c) => c.key === selectedKey) ?? campaigns[0];

  return (
    <div>
      <label htmlFor="campaign-select" className="sr-only">
        Choose what to support
      </label>
      <select
        id="campaign-select"
        value={selectedKey}
        onChange={(e) => setSelectedKey(e.target.value)}
        className="w-full block mb-6 px-4 py-3 rounded border-[1.5px] border-maroon/30 bg-cream text-maroon font-semibold text-[0.95rem] cursor-pointer"
      >
        {campaigns.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label}
          </option>
        ))}
      </select>

      <div
        key={selected.key}
        className="relative overflow-hidden w-full rounded-lg"
        style={{ height: 900 }}
      >
        <iframe
          title={`${selected.label} — powered by Zeffy`}
          className="absolute border-0 inset-0 w-full h-full"
          src={selected.embedSrc}
          allow="payment"
        />
      </div>

      <p className="mt-4 text-center text-sm text-ink/60">
        Trouble loading?{" "}
        <a
          href={selected.zeffyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Open on Zeffy
        </a>
      </p>
    </div>
  );
}
