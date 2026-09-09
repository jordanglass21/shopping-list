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

  const recipe = recipes?.find((r) => r.id === item.recipe_id);

  function startEdit() {
    setEditName(item.name);
    setEditQty(item.quantity ?? "");
    setEditCat(item.category_id);
    setIsEditing(true);
  }

  function saveEdit() {
    if (!editName.trim()) return;
    onUpdate(item.id, editName.trim(), editQty.trim() || null, editCat);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <li className="flex flex-col gap-2 border-b border-hairline py-3">
        <div className="flex gap-2">
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 border-b border-stone-light bg-transparent pb-1 text-ink outline-none focus:border-ink"
            placeholder="Item"
          />
          <input
            value={editQty}
            onChange={(e) => setEditQty(e.target.value)}
            className="w-20 border-b border-stone-light bg-transparent pb-1 text-sm text-ink-soft outline-none focus:border-ink"
            placeholder="Qty"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={editCat ?? ""}
            onChange={(e) => setEditCat(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 bg-transparent text-xs text-ink-soft outline-none"
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
            className="text-xs uppercase tracking-wide text-ink underline underline-offset-4"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs uppercase tracking-wide text-stone"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="group flex items-center gap-3 border-b border-hairline py-2.5">      <button
      onClick={() => onToggle(item.id, !item.checked)}
      aria-label={item.checked ? "Mark as not bought" : "Mark as bought"}
      className="shrink-0"
    >
      <span
        className={
          item.checked
            ? "block h-[9px] w-[9px] rounded-full bg-neutral-300"
            : "block h-[9px] w-[9px] rounded-full border-[1.5px] border-stone-light transition hover:border-ink"
        }
      />
    </button>

      <span
        className={
          item.checked
            ? "text-[15px] text-neutral-500 line-through decoration-neutral-400"
            : "text-[15px] text-ink"
        }
      >
        {item.name}
      </span>

      {item.quantity && (
        <span className="text-sm text-stone-light">{item.quantity}</span>
      )}

      {recipe && (
        <span
          className="ml-auto block h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: recipe.color }}
          title={recipe.name}
        />
      )}

      <button
        onClick={startEdit}
        aria-label="Edit item"
        className={`text-stone-light opacity-0 transition group-hover:opacity-100 hover:text-ink ${recipe ? "" : "ml-auto"}`}
      >
        <span className="text-xs uppercase tracking-wide">edit</span>
      </button>

      <button
        onClick={() => onDelete(item.id)}
        aria-label="Delete item"
        className="text-stone-light opacity-0 transition group-hover:opacity-100 hover:text-ink"
      >
        <span className="text-xs uppercase tracking-wide">×</span>
      </button>
    </li>
  );
}