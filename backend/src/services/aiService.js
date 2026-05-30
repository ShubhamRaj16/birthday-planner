const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-20250514';

const PROMPTS = {
  themes: (ctx) =>
    `Suggest 5 creative birthday party theme ideas for ${ctx.childName}, a ${ctx.age}-year-old` +
    `${ctx.interests ? ` who likes ${ctx.interests}` : ''}. ` +
    `Return ONLY a JSON array of 5 strings. Each string: a short theme name + one-line description. ` +
    `Example format: ["Underwater Adventure — ocean creatures and blue décor", ...]`,

  activities: (ctx) =>
    `Suggest 5 fun birthday party activities for ${ctx.childName}, a ${ctx.age}-year-old` +
    `${ctx.theme ? ` with a ${ctx.theme} theme` : ''}` +
    `${ctx.interests ? ` who likes ${ctx.interests}` : ''}. ` +
    `Return ONLY a JSON array of 5 strings.`,

  gifts: (ctx) =>
    `Suggest 5 birthday gift ideas for ${ctx.childName}, a ${ctx.age}-year-old` +
    `${ctx.interests ? ` who likes ${ctx.interests}` : ''}. ` +
    `Include a rough price range in each suggestion. Return ONLY a JSON array of 5 strings.`,

  venue: (ctx) =>
    `Suggest 5 birthday party venue ideas for ${ctx.childName}, a ${ctx.age}-year-old` +
    `${ctx.theme ? ` with a ${ctx.theme} theme` : ''}. ` +
    `Return ONLY a JSON array of 5 strings.`,

  catering: (ctx) =>
    `Suggest 5 catering or food ideas for ${ctx.childName}'s birthday party` +
    `${ctx.theme ? ` with a ${ctx.theme} theme` : ''}` +
    `${ctx.allergies ? `. Allergy note: avoid ${ctx.allergies}` : ''}. ` +
    `Return ONLY a JSON array of 5 strings.`,

  message: (ctx) =>
    `Write a warm, friendly WhatsApp birthday party invitation message for ${ctx.childName}'s ${ctx.age}th birthday` +
    `${ctx.theme ? ` (${ctx.theme} theme)` : ''}` +
    `${ctx.venue ? ` at ${ctx.venue}` : ''}. ` +
    `Use these placeholders exactly: {guestName}, {childName}, {date}, {venue}, {myGateLink}. ` +
    `Keep it under 150 words. Return the message text only — no JSON, no explanation.`,
};

function buildContext(event, child) {
  const dob = child?.dob ? new Date(child.dob) : null;
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;
  return {
    childName: child?.name || 'the birthday child',
    age: age != null ? String(age) : 'unknown',
    interests: child?.interests || null,
    allergies: child?.allergies || null,
    theme: event?.theme || null,
    venue: event?.venue || null,
  };
}

function parseJsonArray(text) {
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch {
    // fall through
  }
  // Fallback: split on numbered list lines or newlines
  return text
    .split('\n')
    .map((l) => l.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

async function getSuggestions(type, event, child) {
  if (!PROMPTS[type]) throw Object.assign(new Error(`Unknown type: ${type}`), { status: 400 });

  const ctx = buildContext(event, child);
  const promptText = PROMPTS[type](ctx);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: promptText }],
  });

  const text = (response.content[0]?.text || '').trim();

  const suggestions = type === 'message' ? [text] : parseJsonArray(text);
  return { type, suggestions };
}

module.exports = { getSuggestions };
