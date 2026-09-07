"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useItems } from "@/hooks/useItems";
import type { User } from "@supabase/supabase-js";
import { ItemRow } from "@/components/ItemRow";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { items, categories, loading: itemsLoading, addItem, toggleItem, deleteItem, updateCategory } = useItems();
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    await addItem(newName.trim(), newQty.trim() || null);
    setNewName("");
    setNewQty("");
  }

  const grouped = categories
    .map((cat) => ({
      category: cat,
      items: items.filter((item) => item.category_id === cat.id),
    }))
    .filter((group) => group.items.length > 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-100 flex items-center justify-center text-stone-400">
        Loading…
      </main>
    );
  }
  if (!user) return null;

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-stone-800">My list</h1>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-medium text-white">
              {items.length}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-stone-400 hover:text-stone-600"
            >
              Log out
            </button>
          </div>
        </div>
        <p className="mb-6 text-xs text-stone-400">{user.email}</p>

        {/* Add item */}
        <div className="mb-6 flex gap-2">
          <input
            placeholder="Add something…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 rounded-xl bg-white px-4 py-2.5 text-stone-800 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            placeholder="Qty"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="w-16 rounded-xl bg-white px-3 py-2.5 text-stone-800 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            onClick={handleAdd}
            className="flex w-11 items-center justify-center rounded-xl bg-amber-500 text-white transition hover:bg-amber-600 active:scale-95"
          >
            +
          </button>
        </div>

        {/* List */}
        {itemsLoading ? (
          <p className="text-stone-400">Loading items…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white px-4 py-10 text-center text-stone-400">
            Nothing here yet. Add your first item above.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.category.id}>
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-stone-500">
                  {group.category.name}
                </p>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    categories={categories}
                    onToggle={toggleItem}
                    onDelete={deleteItem}
                    onChangeCategory={updateCategory}
                  />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}