export function searchExcerpt(content: string, query: string) {
  const text = content.replace(/\s+/g, " ").trim();
  const normalizedText = text.toLowerCase();
  const terms = query.trim().toLowerCase().split(/\s+/);
  const matches = terms.map(term => normalizedText.indexOf(term)).filter(index => index >= 0);
  const start = Math.max(0, (matches.length ? Math.min(...matches) : 0) - 60);
  const end = Math.min(text.length, start + 180);
  return `${start ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}
