"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Check if there's already a session on load
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for login/logout happening while the page is open
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 3. Clean up the listener when the component unmounts
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Once we know there's no user, send them to login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loading) return <main style={{ padding: 40 }}>Loading…</main>;
  if (!user) return null; // redirecting

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Shopping List</h1>
      <p>Signed in as {user.email}</p>
      <button onClick={handleLogout} style={{ padding: 8 }}>
        Log out
      </button>
    </main>
  );
}