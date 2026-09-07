"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Item } from "@/types"
import { guessCategory } from "@/lib/categorize";

export function useItems() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

    // fetch users items on mount
    useEffect(() => {
        fetchItems();
    }, []);

    // fetch categories on mount
    useEffect(() => {
        supabase
            .from("categories")
            .select("id, name")
            .then(({ data }) => setCategories(data ?? []));
    }, []);

    async function fetchItems() {
        const { data, error } = await supabase
            .from("items")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Failed to fetch items:", error.message);
        } else {
            setItems(data ?? []);
        }
        setLoading(false);
    }

    async function addItem(name: string, quantity: string | null) {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Guess the category name, then find its id
        const guessedName = guessCategory(name);
        const category = categories.find((c) => c.name === guessedName);
        const category_id = category?.id ?? null;

        const { data, error } = await supabase
            .from("items")
            .insert({ name, quantity, user_id: user.id, category_id })
            .select()
            .single();

        if (error) {
            console.error("Failed to add item:", error.message);
            return;
        }
        setItems((prev) => [data, ...prev]);
    }

    async function toggleItem(id: number, checked: boolean) {
        //flip it in local state immediately
            setItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, checked } : item))
        );

        const { error } = await supabase
            .from("items")
            .update({ checked })
            .eq("id", id);

        if (error) {
            console.error("Failed to toggle item:", error.message);
                // Roll back on failure
                setItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, checked: !checked } : item))
            );
        }
    }

    async function deleteItem(id: number) {
        // remove from local state
        const previous = items;
        setItems((prev) => prev.filter((item) => item.id !== id));

        const { error } = await supabase.from("items").delete().eq("id", id);

        if (error) {
            console.error("Failed to delete item:", error.message);
            setItems(previous); // roll back
        }
    }

    return { items, categories, loading, addItem, toggleItem, deleteItem };
}