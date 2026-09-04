"use client";

import type { Item } from "@/types";

type ItemRowProps = {
    item: Item;
    onToggle: (id: number, checked: boolean) => void;
    onDelete: (id: number) => void;
};

export function ItemRow({ item, onToggle, onDelete }: ItemRowProps) {
    return (
        <li className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
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

            <span
                className={
                    item.checked ? "text-stone-400 line-through" : "text-stone-800"
                }
            >
                {item.name}
            </span>

            {item.quantity && (
                <span className="text-sm text-stone-400">· {item.quantity}</span>
            )}

            <button
                onClick={() => onDelete(item.id)}
                aria-label="Delete item"
                className="ml-auto text-stone-300 transition hover:text-red-400"
            >
                ✕
            </button>


        </li>
    );
}