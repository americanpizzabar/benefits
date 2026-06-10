import Anthropic from "@anthropic-ai/sdk";

/** Shared Anthropic client. Returns null when no API key is configured. */
let cached: Anthropic | null = null;
export function getAnthropic(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Anthropic({ apiKey: key });
  return cached;
}

export const AI_MODEL = "claude-opus-4-8";

const SCENES = ["eat", "move_learn", "relax_play", "life_events"] as const;

export type ParsedBenefit = {
  scene: (typeof SCENES)[number];
  title: string;
  action: string | null;
  vendor: string | null;
  amount: number | null;
  discount_pct: number | null;
  details: string | null;
};

function firstText(message: Anthropic.Message): string {
  const block = message.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}

const nullableNumber = { anyOf: [{ type: "number" }, { type: "null" }] };
const nullableString = { anyOf: [{ type: "string" }, { type: "null" }] };

/** JSON schema for the structured PDF-breakdown response. */
const PARSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["benefits"],
  properties: {
    benefits: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "scene",
          "title",
          "action",
          "vendor",
          "amount",
          "discount_pct",
          "details",
        ],
        properties: {
          scene: { type: "string", enum: SCENES as unknown as string[] },
          title: { type: "string" },
          action: nullableString,
          vendor: nullableString,
          amount: nullableNumber,
          discount_pct: nullableNumber,
          details: nullableString,
        },
      },
    },
  },
} as const;

/**
 * Break an HR benefits PDF into structured, actionable perks using Claude.
 * @param pdfBase64 base64-encoded PDF bytes
 */
export async function parseBenefitsPdf(
  pdfBase64: string,
): Promise<ParsedBenefit[]> {
  const client = getAnthropic();
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured");

  const message = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      format: { type: "json_schema", schema: PARSE_SCHEMA as Record<string, unknown> },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: [
              "You are turning a company's HR benefits PDF into concrete, actionable perks for an employee app.",
              "Extract every distinct benefit you can find. For each one:",
              "- scene: which part of daily life it fits — 'eat' (food/dining), 'move_learn' (fitness, books, courses, certifications), 'relax_play' (movies, hotels, leisure, time off), or 'life_events' (family, marriage, bereavement, childcare, nursing).",
              "- title: a short English name for the perk.",
              "- action: one short sentence on how the employee uses/claims it (English).",
              "- vendor: the provider or partner if stated, else null.",
              "- amount: the fixed monetary value or subsidy in JPY as a number, else null.",
              "- discount_pct: the discount percentage as a number (e.g. 10 for 10% off), else null.",
              "- details: a one or two sentence English description.",
              "Use null where a value is not stated. Do not invent perks that are not in the document.",
            ].join("\n"),
          },
        ],
      },
    ],
  });

  const parsed = JSON.parse(firstText(message)) as { benefits: ParsedBenefit[] };
  return parsed.benefits ?? [];
}

const TRANSLATE_BENEFIT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "action", "details", "context_tip"],
  properties: {
    title: { type: "string" },
    action: nullableString,
    details: nullableString,
    context_tip: nullableString,
  },
} as const;

export type BenefitTranslation = {
  title: string;
  action: string | null;
  details: string | null;
  context_tip: string | null;
};

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  ja: "Japanese",
};

/**
 * Translate a benefit's user-facing copy into the target locale, adding a short
 * cultural "context tip" when the perk carries country-specific nuance.
 */
export async function translateBenefit(
  benefit: { title: string; action: string | null; details: string | null },
  targetLocale: string,
): Promise<BenefitTranslation> {
  const client = getAnthropic();
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured");

  const target = LOCALE_NAMES[targetLocale] ?? targetLocale;
  const message = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 1500,
    output_config: {
      format: {
        type: "json_schema",
        schema: TRANSLATE_BENEFIT_SCHEMA as Record<string, unknown>,
      },
    },
    messages: [
      {
        role: "user",
        content: [
          `Translate this employee-benefit into ${target}. Keep it natural and concise.`,
          "If the benefit reflects a culture-specific custom that an international employee might not understand,",
          "add a one-sentence 'context_tip' in the target language explaining the nuance; otherwise set context_tip to null.",
          "",
          `title: ${benefit.title}`,
          `action: ${benefit.action ?? ""}`,
          `details: ${benefit.details ?? ""}`,
        ].join("\n"),
      },
    ],
  });

  return JSON.parse(firstText(message)) as BenefitTranslation;
}

const TRANSLATE_TEXT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["translation"],
  properties: { translation: { type: "string" } },
} as const;

/** Translate a free-text review body into the target locale. */
export async function translateText(
  text: string,
  targetLocale: string,
): Promise<string> {
  const client = getAnthropic();
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured");

  const target = LOCALE_NAMES[targetLocale] ?? targetLocale;
  const message = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 1000,
    output_config: {
      format: { type: "json_schema", schema: TRANSLATE_TEXT_SCHEMA as Record<string, unknown> },
    },
    messages: [
      {
        role: "user",
        content: `Translate the following employee review into ${target}. Keep the tone casual.\n\n${text}`,
      },
    ],
  });

  const parsed = JSON.parse(firstText(message)) as { translation: string };
  return parsed.translation;
}
