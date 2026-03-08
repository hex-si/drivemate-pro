import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const HUB_URL = Deno.env.get("HUB_URL");
  const HUB_API_KEY = Deno.env.get("HUB_API_KEY");

  if (!HUB_URL) {
    return new Response(JSON.stringify({ error: "HUB_URL not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!HUB_API_KEY) {
    return new Response(JSON.stringify({ error: "HUB_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { hubOrderId, status, agentId, agentName, cancelReason } = await req.json();

    if (!hubOrderId || !status || !agentId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${HUB_URL}/api/orders/${hubOrderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": HUB_API_KEY,
      },
      body: JSON.stringify({
        status,
        agentId,
        agentName,
        ...(cancelReason && { cancelReason }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Hub error [${response.status}]: ${errorText}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
