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
    loading: listsLoading,
    saveAsTemplate,
    loadTemplate,
    deleteList,
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

  const { items, categories, recipes, loading: itemsLoading, addItem, toggleItem, deleteItem, updateItem, clearList } =
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
    if (template) setLoadedTemplateId(template.id);
  }

  async function handleLoadTemplate(templateId: number) {
    await loadTemplate(templateId);
    setLoadedTemplateId(templateId);
  }

  async function handleClear() {
    if (items.length === 0) return;
    const ok = window.confirm("Are you sure you want to clear the entire list?");
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

  async function handleDeleteLoadedList() {
    if (loadedTemplateId == null) return;
    const tmpl = templates.find((t) => t.id === loadedTemplateId);
    if (!tmpl) return;

    const ok = window.confirm(`Delete "${tmpl.name}" and clear the current list?`);
    if (!ok) return;

    if (currentListId != null) {
      await clearList(currentListId);
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
      <main className="flex min-h-screen items-center justify-center bg-cream text-stone">
        Loading…
      </main>
    );
  }
  if (!user) return null;

  return (
    <main className="min-h-screen bg-cream px-5 py-10">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone">
              Shopping
            </p>
            <h1 className="font-serif text-4xl leading-none text-ink">
              {displayName}
            </h1>
          </div>
          <div className="pt-1 text-right">
            <div className="font-serif text-2xl leading-none text-ink">
              {items.filter((i) => !i.checked).length}
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-stone">
              left
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mb-6 mt-3 text-[10px] uppercase tracking-wide text-stone hover:text-ink-soft"
        >
          Log out · {user.email}
        </button>

        {/* Actions bar */}
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-hairline pb-4">
          <button onClick={handleSaveAs} className="text-xs uppercase tracking-wide text-ink-soft hover:text-ink">
            Save as
          </button>
          <button onClick={() => setShowImport(true)} className="text-xs uppercase tracking-wide text-ink-soft hover:text-ink">
            Import recipe
          </button>
          <button onClick={handleClear} className="text-xs uppercase tracking-wide text-ink-soft hover:text-ink">
            Clear
          </button>

          {templates.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) handleLoadTemplate(id);
              }}
              className="bg-transparent text-xs uppercase tracking-wide text-ink-soft outline-none hover:text-ink"
            >
              <option value="">Load saved</option>
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
              className="text-xs uppercase tracking-wide text-stone hover:text-ink"
              title="Delete this saved list"
            >
              Delete list
            </button>
          )}
        </div>

        {/* Add item */}
        <div className="mb-8 flex items-center gap-3 border-b border-ink pb-2">
          <span className="text-ink-soft">+</span>
          <input
            placeholder="Add an item"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 bg-transparent text-ink placeholder:text-stone outline-none"
          />
          <input
            placeholder="qty"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="w-14 bg-transparent text-right text-sm text-ink-soft placeholder:text-stone outline-none"
          />
        </div>

        {/* List */}
        {itemsLoading || listsLoading ? (
          <p className="text-stone">Loading items…</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-stone">
            Nothing here yet. Add your first item above.
          </p>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.category.id}>
                <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  {group.category.name}
                </p>
                <ul>
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