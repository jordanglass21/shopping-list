"use client";

import { supabase } from "@/lib/supabase";
import { guessCategory } from "@/lib/categorize";
import type { ParsedIngredient } from "@/lib/parseRecipe";

export function useRecipeImport() {
  async function importRecipe(
    recipeName: string,
    ingredients: ParsedIngredient[],
    listId: number,
    color: string
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || listId == null) return;

    // Fetch categories so we can guess each ingredient's aisle
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name");

    // Create the recipe record with the user-picked color
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
      const category = (categories ?? []).find((c) => c.name === guessedName);
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