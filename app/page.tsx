import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data, error } = await supabase.auth.getSession();

  return (
      <h1>Shopping List</h1>
  ) 
}