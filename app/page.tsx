"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useItems } from "@/hooks/useItems";
import { useLists } from "@/hooks/useLists";
import { ItemRow } from "@/components/ItemRow";
import type { User } from "@supabase/supabase-js";
import { RecipeImport } from "@/components/RecipeImport";
import { useRecipeImport } from "@/hooks/useRecipeImport";

export default function Home() {

  const {
    lists,
    currentListId,
    setCurrentListId,
    loading: listsLoading,
    saveAsTemplate,
    loadTemplate,
    deleteList
  } = useLists();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [loadedTemplateId, setLoadedTemplateId] = useState<number | null>(null);

  const router = useRouter();
  const { importRecipe } = useRecipeImport();

  const currentList = lists.find((l) => l.id === currentListId);
  useEffect(() => {
    if (currentList?.source_template_id != null) {
      setLoadedTemplateId(currentList.source_template_id);
    }
  }, [currentList]);

  const loadedTemplate = lists.find((l) => l.id === loadedTemplateId);
  const displayName = loadedTemplate?.name ?? currentList?.name ?? "My List";
  const { items, categories, recipes, loading: itemsLoading, addItem, toggleItem, deleteItem, updateCategory, updateItem, clearList } =
    useItems(currentListId);

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

  async function handleSaveAs() {
    if (currentListId == null) return;
    const itemWithRecipe = items.find((it) => it.recipe_id != null);
    const suggested = itemWithRecipe
      ? recipes.find((r) => r.id === itemWithRecipe.recipe_id)?.name ?? ""
      : "";
    const name = window.prompt("Save this list as:", suggested);
    if (!name || !name.trim()) return;

    const template = await saveAsTemplate(name.trim(), currentListId);
    if (template) setLoadedTemplateId(template.id);   // ← now "linked" to the saved list
  }

  async function handleLoadTemplate(templateId: number) {
    await loadTemplate(templateId);
    setLoadedTemplateId(templateId);
  }

  async function handleClear() {
    if (items.length === 0) return;
    const ok = window.confirm("Are you sure you want to clear the entire List?");
    if (!ok) return;

    await clearList();

    if (currentListId != null) {
      await supabase
        .from("lists")
        .update({ name: "My List", source_template_id: null })
        .eq("id", currentListId);
    }
    setLoadedTemplateId(null);
  }

  async function handleDeleteList(id: number, name: string) {
    const ok = window.confirm(`Delete saved list "${name}"? This can't be undone.`);
    if (ok) await deleteList(id);
  }

  async function handleDeleteLoadedList() {
    if (loadedTemplateId == null) return;
    const tmpl = templates.find((t) => t.id === loadedTemplateId);
    if (!tmpl) return;

    const ok = window.confirm(
      `Delete "${tmpl.name}" and clear the current list?`
    );
    if (!ok) return;

    if (currentListId != null) {
      await clearList(currentListId);
      // Reset the working list's name and unlink it, so the title returns to default
      await supabase
        .from("lists")
        .update({ name: "My List", source_template_id: null })
        .eq("id", currentListId);
    }
    await deleteList(tmpl.id);
    setLoadedTemplateId(null);
  }

  const grouped = categories
    .map((cat) => ({
      category: cat,
      items: items.filter((item) => item.category_id === cat.id),
    }))
    .filter((group) => group.items.length > 0);

  const templates = lists.filter((l) => l.is_template);

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
          <h1 className="text-2xl font-medium text-stone-800">{displayName}</h1>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-medium text-white">
              {items.length}
            </span>
            <button onClick={handleLogout} className="text-sm text-stone-400 hover:text-stone-600">
              Log out
            </button>
          </div>
        </div>
        <p className="mb-6 text-xs text-stone-400">{user.email}</p>

        {/* Saved lists bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white transition hover:bg-amber-600"
          >
            Import recipe
          </button>

          <button
            onClick={handleSaveAs}
            className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm text-white transition hover:bg-stone-700"
          >
            Save
          </button>

          <button
            onClick={handleClear}
            className="rounded-lg bg-stone-200 px-3 py-1.5 text-sm text-stone-700 transition hover:bg-red-100 hover:text-red-600"
          >
            Clear
          </button>


          {templates.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) handleLoadTemplate(id);
              }}
              className="rounded-lg bg-white px-3 py-1.5 text-sm text-stone-600 outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Load saved list…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          {loadedTemplateId != null && (
            <button
              onClick={handleDeleteLoadedList}
              className="rounded-lg bg-stone-200 px-3 py-1.5 text-sm text-stone-700 transition hover:bg-red-100 hover:text-red-600"
              aria-label="Delete this saved list"
              title="Delete this saved list"
            >
              Delete
            </button>
          )}
        </div>

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
        {itemsLoading || listsLoading ? (
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
                      recipes={recipes}
                      onToggle={toggleItem}
                      onDelete={deleteItem}
                      onUpdate={updateItem}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      {showImport && (
        <RecipeImport
          categories={categories}
          currentListId={currentListId}
          onImport={importRecipe}
          onClose={() => setShowImport(false)}
          onDone={() => window.location.reload()}
        />
      )}
    </main>
  );
}