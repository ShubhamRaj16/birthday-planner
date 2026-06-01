import Anthropic from '@anthropic-ai/sdk';
import type { Child, Event } from '@prisma/client';
import type { SuggestionType, AiContext, SuggestionResult } from '../types';

const MODEL = 'claude-sonnet-4-20250514';

interface AnthropicClient {
  messages: {
    create: (params: {
      model: string;
      max_tokens: number;
      messages: Array<{ role: string; content: string }>;
    }) => Promise<{ content: Array<{ text?: string }> }>;
  };
}

// Lazy construction (not import): the SDK ctor reads ANTHROPIC_API_KEY, so we
// defer `new Anthropic(...)` until first use. Tests inject a mock via
// _setClientForTesting before getClient() ever constructs the real client.
let _client: AnthropicClient | null = null;

function getClient(): AnthropicClient {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) as unknown as AnthropicClient;
  }
  return _client;
}

type PromptFn = (ctx: AiContext) => string;
const PROMPTS: Record<SuggestionType, PromptFn> = {
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

function buildContext(event: Partial<Event> | null, child: Partial<Child> | null): AiContext {
  const dob = child?.dob ? new Date(child.dob) : null;
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;
  return {
    childName: child?.name ?? 'the birthday child',
    age: age != null ? String(age) : 'unknown',
    interests: child?.interests ?? null,
    allergies: child?.allergies ?? null,
    theme: event?.theme ?? null,
    venue: event?.venue ?? null,
  };
}

function parseJsonArray(text: string): string[] {
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as string[];
  } catch {
    // fall through to line-split fallback
  }
  return text
    .split('\n')
    .map((l) => l.replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

export async function getSuggestions(
  type: string,
  event: Partial<Event> | null,
  child: Partial<Child> | null,
): Promise<SuggestionResult> {
  if (!PROMPTS[type as SuggestionType]) {
    throw Object.assign(new Error(`Unknown type: ${type}`), { status: 400 });
  }
  const ctx = buildContext(event, child);
  const promptText = PROMPTS[type as SuggestionType](ctx);
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: promptText }],
  });
  const text = (response.content[0]?.text ?? '').trim();
  const suggestions = type === 'message' ? [text] : parseJsonArray(text);
  return { type: type as SuggestionType, suggestions };
}

export function _resetClient(): void { _client = null; }
export function _setClientForTesting(mock: AnthropicClient): void { _client = mock; }
