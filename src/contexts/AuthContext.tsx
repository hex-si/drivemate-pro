import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AgentProfile {
  id: string;
  agent_code: string;
  full_name: string;
  user_id: string;
  vehicle: string;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  total_deliveries: number;
  total_earnings: number;
  average_rating: number;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  agent: AgentProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, agentCode: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgent = async (userId: string) => {
    const { data } = await supabase
      .from("delivery_agents")
      .select("*")
      .eq("user_id", userId)
      .single();
    setAgent(data as AgentProfile | null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchAgent(session.user.id), 0);
        } else {
          setAgent(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAgent(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string, agentCode: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) return { error: error as Error };

    // Create agent profile
    if (data.user) {
      const { error: agentError } = await supabase.from("delivery_agents").insert({
        user_id: data.user.id,
        full_name: fullName,
        agent_code: agentCode,
      });
      if (agentError) return { error: agentError as unknown as Error };

      // Assign agent role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: "agent",
      });
      if (roleError) return { error: roleError as unknown as Error };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAgent(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, agent, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
