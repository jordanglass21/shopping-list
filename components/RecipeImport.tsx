"use client";

import { useState } from "react";
import { parseRecipe, type ParsedIngredient } from "@/lib/parseRecipe";

type RecipeImportProps = {
  categories: { id: number; name: string }[];
  currentListId: number | null;
  onImport: (
    recipeName: string,
    ingredients: ParsedIngredient[],
    listId: number,
    categories: { id: number; name: string }[]
  ) => Promise<unknown>;
  onClose: () => void;
  onDone: () => void;
};

export function RecipeImport({
  categories,
  currentListId,
  onImport,
  onClose,
  onDone,
}: RecipeImportProps) {
  const [stage, setStage] = useState<"input" | "review">("input");
  const [recipeName, setRecipeName] = useState("");
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedIngredient[]>([]);
  // Track which parsed rows the user wants to keep
  const [keep, setKeep] = useState<boolean[]>([]);
  const [saving, setSaving] = useState(false);

  function handleParse() {
    if (!rawText.trim()) return;
    const result = parseRecipe(rawText);
    setParsed(result);
    setKeep(result.map(() => true)); // keep all by default
    setStage("review");
  }

  // Edit a single parsed row's name or quantity
  function editRow(index: number, field: "name" | "quantity", value: string) {
    setParsed((prev) =>
      prev.map((ing, i) =>
        i === index ? { ...ing, [field]: value || null } : ing
      )
    );
  }

  async function handleAdd() {
    if (currentListId == null) return;
    const chosen = parsed.filter((_, i) => keep[i]);
    if (chosen.length === 0) return;
    setSaving(true);
    await onImport(
      recipeName.trim() || "Recipe",
      chosen,
      currentListId,
      categories
    );
    setSaving(false);
    onDone();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-stone-100 p-5 sm:rounded-2xl">
        {stage === "input" ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-stone-800">Import a recipe</h2>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <input
              placeholder="Recipe name (e.g. Sunday Chili)"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="mb-3 w-full rounded-xl bg-white px-4 py-2.5 text-stone-800 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400"
            />

            <textarea
              placeholder={"Paste ingredients, one per line:\n2 cups flour\n3 eggs\n1 onion, diced\nsalt to taste"}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={8}
              className="mb-4 w-full rounded-xl bg-white px-4 py-3 text-stone-800 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400"
            />

            <button
              onClick={handleParse}
              disabled={!rawText.trim()}
              className="w-full rounded-xl bg-amber-500 py-2.5 text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              Parse ingredients
            </button>
          </>
        ) : (
          <>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-medium text-stone-800">Review ingredients</h2>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>
            <p className="mb-4 text-xs text-stone-500">
              Flagged rows we weren&apos;t sure about — edit or uncheck before adding.
            </p>

            <ul className="mb-4 space-y-2">
              {parsed.map((ing, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 rounded-xl bg-white p-2 ${
                    !ing.confident ? "ring-2 ring-amber-300" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={keep[i]}
                    onChange={() =>
                      setKeep((prev) => prev.map((k, j) => (j === i ? !k : k)))
                    }
                    className="h-4 w-4 accent-amber-500"
                  />
                  <input
                    value={ing.name}
                    onChange={(e) => editRow(i, "name", e.target.value)}
                    className="flex-1 rounded-lg bg-stone-50 px-2 py-1 text-sm text-stone-800 outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <input
                    value={ing.quantity ?? ""}
                    placeholder="qty"
                    onChange={(e) => editRow(i, "quantity", e.target.value)}
                    className="w-20 rounded-lg bg-stone-50 px-2 py-1 text-sm text-stone-600 outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  {ing.wasMeasure && (
                    <span className="text-[10px] text-stone-400" title="Cooking measure dropped">
                      measure
                    </span>
                  )}
                  {!ing.confident && (
                    <span className="text-amber-500" title="We weren't sure">
                      ⚠
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <button
                onClick={() => setStage("input")}
                className="rounded-xl bg-stone-200 px-4 py-2.5 text-stone-700 transition hover:bg-stone-300"
              >
                Back
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 rounded-xl bg-amber-500 py-2.5 text-white transition hover:bg-amber-600 disabled:opacity-50"
              >
                {saving ? "Adding…" : "Add to list"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}