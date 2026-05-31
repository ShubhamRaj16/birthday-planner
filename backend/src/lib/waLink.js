function normalisePhone(phone) {
  if (!phone) return null;
  let p = phone.replace(/[-\s()]/g, '');
  if (p.startsWith('+')) p = p.slice(1);
  if (p.startsWith('0')) p = '91' + p.slice(1);
  if (!p.startsWith('91') && p.length === 10) p = '91' + p;
  return /^\d+$/.test(p) ? p : null;
}

function buildWaLink(phone, message) {
  const normalised = normalisePhone(phone);
  if (!normalised) return null;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalised}?text=${encoded}`;
}

module.exports = { normalisePhone, buildWaLink };
