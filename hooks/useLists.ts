"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { List } from "@/types";

export function useLists() {
    const [lists, setLists] = useState<List[]>([]);
    const [currentListId, setCurrentListId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLists();
    }, []);

    async function fetchLists() {
        const { data, error } = await supabase
            .from("lists")
            .select("*")
            .order("created_at");

        if (error) {
            console.error("Failed to fetch lists:", error.message);
            setLoading(false);
            return;
        }

        setLists(data ?? []);

        // Default current list to the first non-template list
        const working = data?.find((l) => !l.is_template);
        if (working) setCurrentListId(working.id);

        setLoading(false);
    }

    // Save current working list's items as a new named template
    async function saveAsTemplate(name: string, sourceListId: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create the template list
        const { data: template, error: listErr } = await supabase
            .from("lists")
            .insert({ user_id: user.id, name, is_template: true })
            .select()
            .single();
        if (listErr || !template) {
            console.error("Failed to create template:", listErr?.message);
            return;
        }

        // Copy the source list's items into the template (unchecked)
        const { data: sourceItems } = await supabase
            .from("items")
            .select("name, quantity, category_id, user_id")
            .eq("list_id", sourceListId);

        if (sourceItems && sourceItems.length > 0) {
            const copies = sourceItems.map((it) => ({
                ...it,
                list_id: template.id,
                checked: false,
            }));
            await supabase.from("items").insert(copies);
        }

        await fetchLists();
        return template;
    }

    // Load a template, stamp its items into a fresh working list, all unchecked
    async function loadTemplate(templateId: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const template = lists.find((l) => l.id === templateId);
        const workingName = template ? template.name : "My List";

        // Create a fresh working list
        const { data: working, error: listErr } = await supabase
            .from("lists")
            .insert({ user_id: user.id, name: workingName, is_template: false })
            .select()
            .single();
        if (listErr || !working) {
            console.error("Failed to create working list:", listErr?.message);
            return;
        }

        // Copy template items into it, unchecked
        const { data: templateItems } = await supabase
            .from("items")
            .select("name, quantity, category_id, user_id")
            .eq("list_id", templateId);

        if (templateItems && templateItems.length > 0) {
            const copies = templateItems.map((it) => ({
                ...it,
                list_id: working.id,
                checked: false,
            }));
            await supabase.from("items").insert(copies);
        }

        await fetchLists();
        setCurrentListId(working.id);
        return working.id;
    }

    async function deleteList(listId: number) {
        const previous = lists;
        setLists((prev) => prev.filter((l) => l.id !== listId));

        const { error } = await supabase.from("lists").delete().eq("id", listId);

        if (error) {
            console.error("Failed to delete list:", error.message);
            setLists(previous); // roll back
        }
    }

    return { lists, currentListId, setCurrentListId, loading, saveAsTemplate, loadTemplate, deleteList };
}