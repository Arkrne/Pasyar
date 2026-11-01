import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { fallbackAnswer, islandContext } from "@/lib/concierge";

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).min(1).max(20),
  trip: z.string().max(4000).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });
  const { messages, trip } = parsed.data;
  const last = messages[messages.length - 1].content;

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ answer: fallbackAnswer(last), source: "offline" });
  }

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: process.env.PASYAR_MODEL ?? "claude-sonnet-5-5",
      max_tokens: 500,
      system: `You are Pasyar's in-trip concierge for Catanduanes, Philippines. Answer in 2 to 4 short sentences, plainly, like a local friend. Only recommend places, prices and operators from the data below. If you are not sure, say so and suggest asking the operator or the Provincial Tourism Office. Reply in the language the traveler uses (English, Filipino or Bikol).\n\n${islandContext()}${trip ? `\n\nTRAVELER'S CURRENT PLAN\n${trip}` : ""}`,
      messages,
    });
    const answer = res.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n")
      .trim();
    return Response.json({ answer: answer || fallbackAnswer(last), source: "claude" });
  } catch {
    return Response.json({ answer: fallbackAnswer(last), source: "offline" });
  }
}
