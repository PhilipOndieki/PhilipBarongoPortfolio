/** Lowercase, "&" to "and", other non-alphanumeric runs to "-". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

/** A slug not in `taken`: adds -2, -3 and so on. Adds the result to `taken`. */
export function uniqueSlug(name: string, taken: Set<string>): string {
  const base = slugify(name) || "lead";
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  taken.add(slug);
  return slug;
}

/** Normalises a phone number to +<country code><number>. */
export function cleanPhone(raw: string | undefined, cc: string): string {
  if (!raw) return "";
  const first = raw.split(/[;,/]/)[0] ?? "";
  const d = first.replace(/[^\d+]/g, "");
  if (!d) return "";
  if (d.startsWith(`+${cc}0`)) return `+${cc}${d.slice(cc.length + 2)}`;
  if (d.startsWith(`${cc}0`)) return `+${cc}${d.slice(cc.length + 1)}`;
  if (d.startsWith("+")) return d;
  if (d.startsWith("00")) return `+${d.slice(2)}`;
  if (d.startsWith("0")) return `+${cc}${d.slice(1)}`;
  if (d.startsWith(cc)) return `+${d}`;
  return `+${cc}${d}`;
}

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
