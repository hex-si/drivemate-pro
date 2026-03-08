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

  if (!HUB_URL || !HUB_API_KEY) {
    return new Response(
      JSON.stringify({
        hubUrl: null,
        error: "Hub credentials not configured",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Return the WebSocket URL and API key for client connection
  const wsUrl = HUB_URL.replace(/^http/, "ws");
  
  return new Response(
    JSON.stringify({
      hubUrl: wsUrl,
      apiKey: HUB_API_KEY,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
