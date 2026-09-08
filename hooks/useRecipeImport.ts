"use client";

import { supabase } from "@/lib/supabase";
import { guessCategory } from "@/lib/categorize";
import type { ParsedIngredient } from "@/lib/parseRecipe";

const RECIPE_COLORS = [
  "#D97706", // amber
  "#65A30D", // olive green
  "#0D9488", // muted teal
  "#0284C7", // dusty blue
  "#7C3AED", // muted violet
  "#DB2777", // warm rose
  "#DC2626", // brick red
  "#EA580C", // burnt orange
];

export function useRecipeImport() {
  // Takes the confirmed ingredients (after human review), a recipe name,
  // the list to add them to, and the categories (for guessing aisles).
  async function importRecipe(
    recipeName: string,
    ingredients: ParsedIngredient[],
    listId: number,
    categories: { id: number; name: string }[]
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || listId == null) return;

    // Pick a color: count existing recipes, take the next palette slot
    const { count } = await supabase
      .from("recipes")
      .select("*", { count: "exact", head: true });
    const color = RECIPE_COLORS[(count ?? 0) % RECIPE_COLORS.length];

    // Create the recipe record
    const { data: recipe, error: recipeErr } = await supabase
      .from("recipes")
      .insert({ user_id: user.id, name: recipeName, color })
      .select()
      .single();
    if (recipeErr || !recipe) {
      console.error("Failed to create recipe:", recipeErr?.message);
      return;
    }

    // Turn each ingredient into an item row, guessing its category
    const rows = ingredients.map((ing) => {
      const guessedName = guessCategory(ing.name);
      const category = categories.find((c) => c.name === guessedName);
      return {
        user_id: user.id,
        list_id: listId,
        recipe_id: recipe.id,
        name: ing.name,
        quantity: ing.quantity,
        category_id: category?.id ?? null,
        checked: false,
      };
    });

    // Insert them all at once
    const { error: itemsErr } = await supabase.from("items").insert(rows);
    if (itemsErr) {
      console.error("Failed to add recipe items:", itemsErr.message);
      return;
    }

    return recipe;
  }

  return { importRecipe };
}