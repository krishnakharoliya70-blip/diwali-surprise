
export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { answers, final_choice, written_response, consent } = await req.json();

    if (!consent || !answers || !final_choice) {
      return new Response(
        JSON.stringify({ error: "Consent required" }),
        { status: 400 }
      );
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    const result = await fetch(
      `${url}/rest/v1/proposal_responses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          answers,
          final_choice,
          written_response: written_response || "",
          consented_at: new Date().toISOString()
        })
      }
    );

    if (!result.ok) {
      return new Response(
        JSON.stringify({ error: "Database save failed" }),
        { status: 500 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;

    const message = `💌 Diwali Response Received

Choice: ${final_choice}

Answers:
${JSON.stringify(answers, null, 2)}

Message:
${written_response || "No written response"}`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text: message
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
};
