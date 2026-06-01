export function normalisePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let p = phone.replace(/[-\s()]/g, '');
  if (p.startsWith('+')) p = p.slice(1);
  if (p.startsWith('0')) p = '91' + p.slice(1);
  if (!p.startsWith('91') && p.length === 10) p = '91' + p;
  return /^\d+$/.test(p) ? p : null;
}

export function buildWaLink(phone: string | null | undefined, message: string): string | null {
  const normalised = normalisePhone(phone);
  if (!normalised) return null;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalised}?text=${encoded}`;
}
