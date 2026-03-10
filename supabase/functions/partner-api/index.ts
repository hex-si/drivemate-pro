import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key, x-hmac-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean);
  // Routes: POST /create-order, GET /order-status/:orderCode, POST /webhook

  try {
    // Authenticate via API key header
    const apiKey = req.headers.get("x-api-key");
    const hmacSig = req.headers.get("x-hmac-signature");

    let partner: any = null;

    if (apiKey) {
      const { data } = await supabase
        .from("partner_api_keys")
        .select("*")
        .eq("api_key", apiKey)
        .eq("is_active", true)
        .maybeSingle();
      partner = data;
    } else if (hmacSig) {
      // HMAC webhook auth: verify signature against all active partners
      const body = await req.clone().text();
      const { data: partners } = await supabase
        .from("partner_api_keys")
        .select("*")
        .eq("is_active", true);

      if (partners) {
        for (const p of partners) {
          const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(p.hmac_secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
          const hex = Array.from(new Uint8Array(sig))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          if (hex === hmacSig) {
            partner = p;
            break;
          }
        }
      }
    }

    if (!partner) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Provide x-api-key header or x-hmac-signature." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route: Create Order
    if (req.method === "POST" && url.pathname.endsWith("/create-order")) {
      const body = await req.json();
      const {
        customer_name,
        customer_phone,
        pickup_address,
        delivery_address,
        items,
        special_instructions,
        agent_code,
        callback_url,
      } = body;

      if (!customer_name || !pickup_address || !delivery_address) {
        return new Response(
          JSON.stringify({ error: "customer_name, pickup_address, delivery_address are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find agent by code if provided
      let agentId = null;
      let agentUserId = null;
      if (agent_code) {
        const { data: agentData } = await supabase
          .from("delivery_agents")
          .select("id, user_id")
          .eq("agent_code", agent_code)
          .maybeSingle();
        if (agentData) {
          agentId = agentData.id;
          agentUserId = agentData.user_id;
        }
      }

      const orderCode = `EXT-${Date.now().toString(36).toUpperCase()}-${partner.partner_name.slice(0, 3).toUpperCase()}`;

      const totalFee = items?.reduce(
        (s: number, i: any) => s + (i.price || 0) * (i.quantity || 1),
        0
      ) || 0;

      const { data: order, error } = await supabase
        .from("delivery_orders")
        .insert({
          order_code: orderCode,
          customer_name,
          customer_phone: customer_phone || null,
          pickup_address,
          delivery_address,
          special_instructions: special_instructions || null,
          agent_id: agentId,
          agent_user_id: agentUserId,
          status: agentId ? "accepted" : "pending_assignment",
          total_fee: totalFee,
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create notification for agent
      if (agentUserId) {
        await supabase.from("notifications").insert({
          user_id: agentUserId,
          title: "New Order from " + partner.partner_name,
          message: `Order ${orderCode} for ${customer_name} at ${delivery_address}`,
          type: "new_order",
          metadata: { order_id: order.id, order_code: orderCode, partner: partner.partner_name },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          order_code: orderCode,
          order_id: order.id,
          status: order.status,
          status_url: `${url.origin}/partner-api/order-status/${orderCode}`,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route: Get Order Status
    if (req.method === "GET" && url.pathname.includes("/order-status/")) {
      const orderCode = url.pathname.split("/order-status/")[1];
      if (!orderCode) {
        return new Response(
          JSON.stringify({ error: "Order code required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: order } = await supabase
        .from("delivery_orders")
        .select("order_code, customer_name, delivery_address, pickup_address, status, total_fee, updated_at, created_at, proof_photo_url")
        .eq("order_code", orderCode)
        .maybeSingle();

      if (!order) {
        return new Response(
          JSON.stringify({ error: "Order not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get timeline
      const { data: timeline } = await supabase
        .from("order_status_timeline")
        .select("status, created_at, notes")
        .eq("order_id", order.order_code)
        .order("created_at", { ascending: true });

      return new Response(
        JSON.stringify({ ...order, timeline: timeline || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Not found",
        available_routes: [
          "POST /partner-api/create-order",
          "GET /partner-api/order-status/:orderCode",
        ],
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
