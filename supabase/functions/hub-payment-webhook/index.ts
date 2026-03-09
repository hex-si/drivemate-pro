import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const HUB_API_KEY = Deno.env.get("HUB_API_KEY");
  const incomingKey = req.headers.get("x-api-key");

  if (!HUB_API_KEY || incomingKey !== HUB_API_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const {
      agent_user_id,
      order_code,
      amount,
      customer_name,
      payment_method,
    } = await req.json();

    if (!agent_user_id || !order_code) {
      return new Response(
        JSON.stringify({ error: "agent_user_id and order_code are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabaseAdmin.from("notifications").insert({
      user_id: agent_user_id,
      type: "earnings",
      title: "Payment Received",
      message: `Payment of ₦${amount ?? "N/A"} confirmed for order ${order_code}${customer_name ? ` from ${customer_name}` : ""}${payment_method ? ` via ${payment_method}` : ""}.`,
      metadata: { order_code, amount, customer_name, payment_method },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
