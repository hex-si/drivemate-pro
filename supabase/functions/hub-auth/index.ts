import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const HUB_URL = Deno.env.get("HUB_URL");
  const HUB_API_KEY = Deno.env.get("HUB_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!HUB_URL || !HUB_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Hub not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { agentId } = await req.json();

    if (!agentId || typeof agentId !== "string" || agentId.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Agent ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanId = agentId.trim().toUpperCase();

    // Verify agent with the hub
    const hubRes = await fetch(`${HUB_URL}/api/agents/${encodeURIComponent(cleanId)}`, {
      method: "GET",
      headers: { "x-api-key": HUB_API_KEY },
    });

    if (!hubRes.ok) {
      const errText = await hubRes.text();
      return new Response(
        JSON.stringify({ error: `Agent not found or hub error: ${errText}` }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hubAgent = await hubRes.json();
    const agentName = hubAgent.name || hubAgent.fullName || hubAgent.full_name || cleanId;

    // Create deterministic Supabase account for this agent
    const email = `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, "")}@agent.deliverpro.local`;
    const password = `hub_agent_${cleanId}_${HUB_API_KEY.slice(0, 8)}`;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try to sign in first
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (signInData?.session) {
      // Update agent name if changed
      await supabaseAdmin
        .from("delivery_agents")
        .update({ full_name: agentName })
        .eq("agent_code", cleanId);

      return new Response(
        JSON.stringify({
          session: signInData.session,
          agent: { agentCode: cleanId, fullName: agentName },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User doesn't exist — create
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError || !newUser.user) {
      return new Response(
        JSON.stringify({ error: createError?.message || "Failed to create user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create agent profile
    await supabaseAdmin.from("delivery_agents").insert({
      user_id: newUser.user.id,
      full_name: agentName,
      agent_code: cleanId,
    });

    // Assign agent role
    await supabaseAdmin.from("user_roles").insert({
      user_id: newUser.user.id,
      role: "agent",
    });

    // Sign in to get session
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (sessionError || !sessionData.session) {
      return new Response(
        JSON.stringify({ error: "Account created but sign-in failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        session: sessionData.session,
        agent: { agentCode: cleanId, fullName: agentName },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
