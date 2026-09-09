"use client";

import { useState } from "react";
import type { Item } from "@/types";

type ItemRowProps = {
  item: Item;
  categories: { id: number; name: string }[];
  recipes: { id: number; name: string; color: string }[];
  onToggle: (id: number, checked: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, name: string, quantity: string | null, categoryId: number | null) => void;
};

export function ItemRow({ item, categories, recipes, onToggle, onDelete, onUpdate }: ItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQty, setEditQty] = useState(item.quantity ?? "");
  const [editCat, setEditCat] = useState<number | null>(item.category_id);

  const currentCategory = categories?.find((c) => c.id === item.category_id);
  const recipe = recipes?.find((r) => r.id === item.recipe_id);

  function startEdit() {
    setEditName(item.name);
    setEditQty(item.quantity ?? "");
    setEditCat(item.category_id);
    setIsEditing(true);
  }

  function saveEdit() {
    if (!editName.trim()) return; // don't allow empty name
    onUpdate(item.id, editName.trim(), editQty.trim() || null, editCat);
    setIsEditing(false);
  }

  // --- EDIT MODE ---
  if (isEditing) {
    return (
      <li className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-3">
        <div className="flex gap-2">
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 rounded-lg bg-stone-50 px-2 py-1 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Item"
          />
          <input
            value={editQty}
            onChange={(e) => setEditQty(e.target.value)}
            className="w-20 rounded-lg bg-stone-50 px-2 py-1 text-sm text-stone-600 outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Qty"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={editCat ?? ""}
            onChange={(e) => setEditCat(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 rounded-lg border-0 bg-stone-100 px-2 py-1 text-xs text-stone-600 outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">No category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={saveEdit}
            className="rounded-lg bg-amber-500 px-3 py-1 text-xs text-white transition hover:bg-amber-600"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="rounded-lg bg-stone-200 px-3 py-1 text-xs text-stone-600 transition hover:bg-stone-300"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  // --- DISPLAY MODE ---
  return (
    <li
      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3"
      style={recipe ? { borderLeft: `4px solid ${recipe.color}` } : undefined}
    >
      <button
        onClick={() => onToggle(item.id, !item.checked)}
        aria-label={item.checked ? "Mark as not bought" : "Mark as bought"}
        className={
          item.checked
            ? "flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-white"
            : "h-5 w-5 rounded-full border-2 border-stone-300 transition hover:border-amber-400"
        }
      >
        {item.checked && "✓"}
      </button>

      <span className={item.checked ? "text-stone-400 line-through" : "text-stone-800"}>
        {item.name}
      </span>

      {item.quantity && <span className="text-sm text-stone-400">· {item.quantity}</span>}

      {recipe && (
        <span
          className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: `${recipe.color}20`, color: recipe.color }}
        >
          {recipe.name}
        </span>
      )}

      <button
        onClick={startEdit}
        aria-label="Edit item"
        className="text-stone-300 transition hover:text-amber-500"
      >
        ✎
      </button>

      <button
        onClick={() => onDelete(item.id)}
        aria-label="Delete item"
        className="text-stone-300 transition hover:text-red-400"
      >
        ✕
      </button>
    </li>
  );
}