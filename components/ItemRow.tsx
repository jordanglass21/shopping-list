"use client";

import { useState } from "react";
import type { Item } from "@/types";

type ItemRowProps = {
  item: Item;
  categories: { id: number; name: string }[];
  recipes: { id: number; name: string; color: string }[];
  onToggle: (id: number, checked: boolean) => void;
  onDelete: (id: number) => void;
  onChangeCategory: (id: number, categoryId: number) => void;
};

export function ItemRow({ item, categories, recipes, onToggle, onDelete, onChangeCategory }: ItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const currentCategory = categories?.find((c) => c.id === item.category_id);
  const recipe = recipes?.find((r) => r.id === item.recipe_id);

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

      {/* Category: quiet label by default, picker when tapped */}
      <div className={recipe ? "" : "ml-auto"}>
        {isEditing ? (
          <select
            autoFocus
            value={item.category_id ?? ""}
            onChange={(e) => {
              onChangeCategory(item.id, Number(e.target.value));
              setIsEditing(false);
            }}
            onBlur={() => setIsEditing(false)}
            className="rounded-lg border-0 bg-stone-100 px-2 py-1 text-xs text-stone-600 outline-none focus:ring-2 focus:ring-amber-400"
          >
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-stone-400 hover:text-amber-500"
          >
            {currentCategory?.name ?? "Set category"}
          </button>
        )}
      </div>

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
