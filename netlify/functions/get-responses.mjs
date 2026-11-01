
export default async (req) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const password = process.env.DASHBOARD_PASSWORD;
  const supplied = req.headers.get("x-admin-password");

  if (!password || supplied !== password) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401 }
    );
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    const result = await fetch(
      `${url}/rest/v1/proposal_responses?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        }
      }
    );

    if (!result.ok) {
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500 }
      );
    }

    return new Response(await result.text(), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
};
