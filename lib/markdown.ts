/**
 * A deliberately small markdown subset — headings, paragraphs, bold, italic,
 * links, and unordered lists. No dependency: `postgres` is meant to stay the
 * only runtime dependency this project has, and newsletter issues don't need
 * tables, code blocks, or nested lists to say "here's what we raised."
 */

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "paragraph", text: para.join(" ") });
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flushPara();
      flushList();
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({ type: "heading", level: heading[1].length as 1 | 2 | 3, text: heading[2] });
      continue;
    }
    const item = /^[-*]\s+(.*)$/.exec(line);
    if (item) {
      flushPara();
      list.push(item[1]);
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}

/** Bold/italic/links, applied to already-escaped text. */
function inline(rawText: string): string {
  return escapeHtml(rawText)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) => {
      const safeHref = /^https?:\/\//i.test(href) ? href : "#";
      return `<a href="${escapeAttr(safeHref)}">${label}</a>`;
    });
}

function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
}

/** Inline-styled HTML fragment for email clients (no external stylesheet). */
export function markdownToEmailHtml(md: string): string {
  return parseBlocks(md)
    .map((b) => {
      if (b.type === "heading") {
        const size = b.level === 1 ? "22px" : b.level === 2 ? "19px" : "17px";
        return `<h${b.level} style="font-family:Georgia,serif;color:#481f25;font-size:${size};margin:24px 0 8px;">${inline(b.text)}</h${b.level}>`;
      }
      if (b.type === "list") {
        return `<ul style="margin:0 0 16px;padding-left:20px;">${b.items
          .map((i) => `<li style="margin-bottom:6px;">${inline(i)}</li>`)
          .join("")}</ul>`;
      }
      return `<p style="margin:0 0 16px;line-height:1.6;">${inline(b.text)}</p>`;
    })
    .join("\n");
}

/** Plain semantic HTML for the site's public archive — styled via .newsletter-body in globals.css. */
export function markdownToWebHtml(md: string): string {
  return parseBlocks(md)
    .map((b) => {
      if (b.type === "heading") return `<h${b.level}>${inline(b.text)}</h${b.level}>`;
      if (b.type === "list")
        return `<ul>${b.items.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`;
      return `<p>${inline(b.text)}</p>`;
    })
    .join("\n");
}

export function markdownToPlaintext(md: string): string {
  return parseBlocks(md)
    .map((b) => {
      if (b.type === "heading") return `${b.text.toUpperCase()}\n${"-".repeat(b.text.length)}`;
      if (b.type === "list") return b.items.map((i) => `  - ${stripInline(i)}`).join("\n");
      return stripInline(b.text);
    })
    .join("\n\n");
}
