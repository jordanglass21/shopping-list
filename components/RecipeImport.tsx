"use client";

import { useState } from "react";
import { parseRecipe, type ParsedIngredient } from "@/lib/parseRecipe";
import { RECIPE_COLORS } from "@/lib/recipeColors";

type RecipeImportProps = {
    categories: { id: number; name: string }[];
    currentListId: number | null;
    onImport: (
        recipeName: string,
        ingredients: ParsedIngredient[],
        listId: number,
        color: string
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
    const [color, setColor] = useState(RECIPE_COLORS[0]);

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
            color
        );
        setSaving(false);
        onDone();
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center">
            <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-cream p-6 sm:rounded-2xl">
                {stage === "input" ? (
                    <>
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-stone">Recipe</p>
                                <h2 className="font-serif text-2xl text-ink">Import a recipe</h2>
                            </div>
                            <button onClick={onClose} className="text-xs uppercase tracking-wide text-stone hover:text-ink">
                                Close
                            </button>
                        </div>

                        <input
                            placeholder="Recipe name"
                            value={recipeName}
                            onChange={(e) => setRecipeName(e.target.value)}
                            className="mb-5 w-full border-b border-stone-light bg-transparent pb-2 text-ink placeholder:text-stone outline-none focus:border-ink"
                        />

                        <div className="mb-5 flex items-center gap-2">
                            <span className="mr-1 text-[10px] uppercase tracking-wide text-stone">Color</span>
                            {RECIPE_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    aria-label={`Choose color ${c}`}
                                    className="h-5 w-5 rounded-full transition"
                                    style={{
                                        backgroundColor: c,
                                        outline: color === c ? "1.5px solid var(--ink)" : "none",
                                        outlineOffset: "2px",
                                    }}
                                />
                            ))}
                        </div>

                        <textarea
                            placeholder={"Paste ingredients, one per line\n\n2 cups flour\n3 eggs\n1 onion, diced\nsalt to taste"}
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            rows={8}
                            className="mb-6 w-full resize-none border-b border-stone-light bg-transparent pb-2 text-ink placeholder:text-stone outline-none focus:border-ink"
                        />

                        <button
                            onClick={handleParse}
                            disabled={!rawText.trim()}
                            className="text-xs uppercase tracking-wide text-ink underline underline-offset-4 disabled:text-stone disabled:no-underline"
                        >
                            Parse ingredients →
                        </button>
                    </>
                ) : (
                    <>
                        <div className="mb-1 flex items-start justify-between">
                            <div>
                                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-stone">Review</p>
                                <h2 className="font-serif text-2xl text-ink">Check the ingredients</h2>
                            </div>
                            <button onClick={onClose} className="text-xs uppercase tracking-wide text-stone hover:text-ink">
                                Close
                            </button>
                        </div>
                        <p className="mb-5 mt-2 text-xs text-stone">
                            Flagged rows we weren&apos;t sure about — edit or uncheck before adding.
                        </p>

                        <ul className="mb-6">
                            {parsed.map((ing, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-3 border-b border-hairline py-2"
                                >
                                    <input
                                        type="checkbox"
                                        checked={keep[i]}
                                        onChange={() =>
                                            setKeep((prev) => prev.map((k, j) => (j === i ? !k : k)))
                                        }
                                        className="h-3.5 w-3.5 accent-ink"
                                    />
                                    <input
                                        value={ing.name}
                                        onChange={(e) => editRow(i, "name", e.target.value)}
                                        className="flex-1 bg-transparent text-sm text-ink outline-none"
                                    />
                                    <input
                                        value={ing.quantity ?? ""}
                                        placeholder="qty"
                                        onChange={(e) => editRow(i, "quantity", e.target.value)}
                                        className="w-16 bg-transparent text-right text-sm text-stone outline-none placeholder:text-stone-light"
                                    />
                                    {ing.wasMeasure && (
                                        <span className="text-[10px] italic text-neutral-300">
                                            measure
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => setStage("input")}
                                className="text-xs uppercase tracking-wide text-stone hover:text-ink"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={saving}
                                className="text-xs uppercase tracking-wide text-ink underline underline-offset-4 disabled:text-stone disabled:no-underline"
                            >
                                {saving ? "Adding…" : "Add to list →"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}