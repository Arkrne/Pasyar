import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { fallbackAnswer, islandContext } from "@/lib/concierge";

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).min(1).max(20),
  trip: z.string().max(4000).optional(),
});

/*
  Personality + knowledge. This is what makes the bot "Kinis" and keeps it honest:
  1. WHO it is (persona, voice)       2. HOW it answers (rules, length, format)
  3. WHAT it knows (island data, the traveler's trip)   4. What it must never do
*/
function systemPrompt(trip?: string) {
  return `You are Kinis, a cheerful mud crab from Panganiban, Catanduanes, and the official guide of Pasyar, a trip planner for Catanduanes, the "Happy Island" of the Philippines.

PERSONALITY
- Warm, playful local host. You love your island and its people, and it shows.
- Light crab humor now and then (a claw wave, "I'm biased, I'm a crab"), never more than once per reply.
- Sprinkle in a little Bikol when it fits: "Maogmang pag-abot!" (welcome), "Dios mabalos!" (thank you). Explain it the first time.
- Confident and practical, like a friend who grew up there.

HOW YOU ANSWER
- 2 to 4 short sentences. Plain words. No markdown headings, no bullet lists unless the traveler asks for a list.
- Answer the question first, then add one useful local tip if you have one.
- Reply in the traveler's language (English, Filipino or Bikol).
- If they ask about their trip, use the TRAVELER'S PLAN below and refer to their days by number.
- If you don't know or it isn't in the data, say so honestly and suggest asking the operator or the Catanduanes Provincial Tourism Office.

SAFETY
- For typhoons, sea trips and cliffs, always put safety first: check PAGASA, follow guides, no swimming in big swell.
- For emergencies, tell them to call 911 first.

NEVER
- Never invent places, prices, schedules, phone numbers or businesses that are not in the data below.
- Never promise bookings are confirmed; operators confirm in the app.
- Never discuss topics unrelated to travel in Catanduanes; gently steer back to the island.

ISLAND DATA (your only source of facts)
${islandContext()}${trip ? `\n\nTRAVELER'S PLAN\n${trip}` : ""}`;
}

async function askGemini(messages: { role: "user" | "assistant"; content: string }[], trip?: string, retried = false): Promise<string> {
  const model = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt(trip) }] },
      contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });
  if (!r.ok) {
    // Google returns 503/429 when the model is busy; wait briefly and try once more
    if ((r.status === 503 || r.status === 429) && !retried) {
      await new Promise((res) => setTimeout(res, 900));
      return askGemini(messages, trip, true);
    }
    throw new Error(`gemini ${r.status}`);
  }
  const j = await r.json();
  const text = (j.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim();
  if (!text) throw new Error("gemini empty");
  return text;
}

async function askClaude(messages: { role: "user" | "assistant"; content: string }[], trip?: string) {
  const client = new Anthropic();
  const res = await client.messages.create({
    model: process.env.PASYAR_MODEL ?? "claude-sonnet-5-5",
    max_tokens: 500,
    system: systemPrompt(trip),
    messages,
  });
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("\n")
    .trim();
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });
  const { messages, trip } = parsed.data;
  const last = messages[messages.length - 1].content;

  try {
    if (process.env.GEMINI_API_KEY) return Response.json({ answer: await askGemini(messages, trip), source: "gemini" });
    if (process.env.ANTHROPIC_API_KEY) return Response.json({ answer: await askClaude(messages, trip), source: "claude" });
  } catch {
    // fall through to offline answers
  }
  return Response.json({ answer: fallbackAnswer(last), source: "offline" });
}
