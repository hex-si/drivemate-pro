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

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const { agentId } = await req.json();

    if (!agentId || typeof agentId !== "string" || agentId.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Agent ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanId = agentId.trim().toUpperCase();

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create deterministic Supabase account for this agent
    const email = `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, "")}@agent.deliverpro.local`;
    const HUB_API_KEY = Deno.env.get("HUB_API_KEY") ?? "default";
    const password = `hub_agent_${cleanId}_${HUB_API_KEY.slice(0, 8)}`;

    // Try to sign in first (existing agent)
    const { data: signInData } =
      await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (signInData?.session) {
      // Fetch agent name from DB
      const { data: agentRow } = await supabaseAdmin
        .from("delivery_agents")
        .select("full_name")
        .eq("agent_code", cleanId)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          session: signInData.session,
          agent: { agentCode: cleanId, fullName: agentRow?.full_name ?? cleanId },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // New agent — create account
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
      full_name: cleanId,
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
        agent: { agentCode: cleanId, fullName: cleanId },
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
