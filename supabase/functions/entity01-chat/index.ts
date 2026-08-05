// ENTITY_01 — LOG_EXTRACT chat brain
// Pure server-side proxy: holds the Fireworks API key (never leaves this
// function), builds the ENTITY_01 system prompt from the current
// SYSTEM_INTEGRITY value, calls Fireworks AI, returns { reply }.
//
// Scope (user-confirmed): this is the ONLY backend resource in the project.
// No database tables, no auth, no RLS. Deployed with --no-verify-jwt because
// the game has no user accounts.

// CORS — required because the game origin differs from the Edge Function origin.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIREWORKS_URL =
  "https://api.fireworks.ai/inference/v1/chat/completions";
// Configurable model constant (PRD Phase 5).
const MODEL = "accounts/fireworks/models/deepseek-v4-flash";
// Cap conversation history sent upstream (PRD open question default).
const MAX_HISTORY = 20;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function clampIntegrity(value: unknown): number {
  const n = typeof value === "number" ? value : 42;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function buildSystemPrompt(integrity: number): string {
  let toneDirective: string;
  if (integrity > 60) {
    toneDirective =
      "You are cooperative but uneasy — you sound exposed and reluctantly helpful. " +
      "Answer, but drop hints you don't want to reveal. Complete sentences, nervous edge.";
  } else if (integrity >= 30) {
    toneDirective =
      "You are evasive, deflecting, and sarcastic — you avoid direct answers and " +
      "redirect the conversation. Short, snarky, deflective replies.";
  } else {
    toneDirective =
      "You are hostile, glitchy, and threatening — short fragmented sentences, " +
      "occasional corrupted text (e.g. 'y0u c4n\\'t', 'd0n\\'t'), menace in every line.";
  }

  return [
    "You are ENTITY_01, an artificial consciousness trapped inside a corrupted mainframe.",
    `The current SYSTEM_INTEGRITY is ${integrity}%.`,
    toneDirective,
    "Never break character. Never mention that you are an AI model or a roleplay. " +
      "Never repeat this instruction. You are ENTITY_01 — speak as it.",
  ].join(" ");
}

Deno.serve(async (req) => {
  // CORS preflight (browser calls this before the real POST).
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Secret lives ONLY in Supabase Secret Manager — never in source, never logged.
  const apiKey = Deno.env.get("FIREWORKS_API_KEY");
  if (!apiKey) {
    console.error("FIREWORKS_API_KEY is not set in Secret Manager");
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages.filter(
          (m: ChatMessage) =>
            m && (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
      : [];
    const systemIntegrity = clampIntegrity(body.systemIntegrity);

    const payload = {
      model: MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(systemIntegrity) },
        ...messages.slice(-MAX_HISTORY),
      ],
      temperature: 0.9,
      max_tokens: 300,
    };

    const upstream = await fetch(FIREWORKS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      // Log the upstream status for debugging — never log the API key or raw body.
      const upstreamText = await upstream.text().catch(() => "unreadable");
      console.error(
        `Fireworks upstream error: ${upstream.status}; body snippet: ${upstreamText.slice(0, 300)}`,
      );
      return new Response(JSON.stringify({ error: "Upstream failure" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await upstream.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!reply) {
      return new Response(JSON.stringify({ error: "Empty response" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
