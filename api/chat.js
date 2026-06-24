export const runtime = "edge";

export async function POST(req) {
  try {
    const { messages, systemPrompt, model } = await req.json();

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured. Add it in Vercel → Settings → Environment Variables." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: systemPrompt || "You are FLASHBOT, a helpful AI assistant. Reply in the same language the user uses.",
          },
          ...messages,
        ],
        max_tokens: 2048,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: "Groq API error" } }));
      return new Response(
        JSON.stringify({ error: err.error?.message || "Groq API error" }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the response directly to the client
    return new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
