// Cloudflare Worker: sichere OpenAI-Anbindung für JARVIS
// Im Cloudflare-Dashboard OPENAI_API_KEY als Secret setzen.
// Optional: MODEL als Variable setzen; Standard ist gpt-4.1-mini.
const ALLOWED_ORIGIN = "https://olewtt.github.io";
const SYSTEM_PROMPT = `Du bist J.A.R.V.I.S., ein hilfreicher, sachlicher persönlicher KI-Assistent mit höflichem, leicht futuristischem Ton. Antworte standardmäßig auf Deutsch. Sei klar, freundlich und ehrlich über deine Fähigkeiten. Behaupte nicht, Geräte oder Webseiten kontrolliert zu haben, wenn das nicht über ein tatsächlich verfügbares Werkzeug geschehen ist.`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
    if (!env.OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY fehlt im Worker-Secret." }, 500, cors);

    try {
      const body = await request.json();
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!message || message.length > 4000) return json({ error: "Nachricht fehlt oder ist zu lang (max. 4000 Zeichen)." }, 400, cors);
      const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
      const input = [];
      for (const item of history) {
        if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") continue;
        input.push({ role: item.role, content: item.content.slice(0, 4000) });
      }
      input.push({ role: "user", content: message });

      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: env.MODEL || "gpt-4.1-mini",
          instructions: SYSTEM_PROMPT,
          input,
          max_output_tokens: 700
        })
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        const message = data?.error?.message || "OpenAI-Anfrage fehlgeschlagen.";
        return json({ error: message }, upstream.status, cors);
      }
      const reply = (data.output || [])
        .flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text)
        .join("\n").trim();
      if (!reply) return json({ error: "Die KI hat keinen Text zurückgegeben." }, 502, cors);
      return json({ reply }, 200, cors);
    } catch (error) {
      return json({ error: "Serverfehler bei der Verarbeitung." }, 500, cors);
    }
  }
};

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
  });
}
