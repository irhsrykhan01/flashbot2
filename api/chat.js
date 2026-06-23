export const runtime = "edge";

export async function POST(req) {
  try {
    const { messages, systemPrompt, model } = await req.json();

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not set in environment variables" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            content:
              systemPrompt ||
              "You are FLASHBOT, a helpful and intelligent AI assistant. Be concise, clear, and friendly. Reply in the same language the user uses.",
          },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "Groq API error" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
