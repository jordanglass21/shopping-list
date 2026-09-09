export type ParsedIngredient = {
  raw: string; // the original line, always kept
  name: string; // the ingredient text (kept generous — trim in review)
  quantity: string | null; // shopping quantity
  wasMeasure: boolean; // did we drop a cooking measure?
  confident: boolean; // did we trust our own parse?
};

// Cooking MEASURES — if the leading quantity uses one of these units, it's
// irrelevant for shopping (you buy the item, not the tablespoon). Drop it.
const MEASURE_UNITS = [
  "teaspoon", "teaspoons", "tsp",
  "tablespoon", "tablespoons", "tbsp", "tbs",
  "cup", "cups",
  "ounce", "ounces", "oz",
  "pound", "pounds", "lb", "lbs",
  "gram", "grams", "g",
  "kilogram", "kilograms", "kg",
  "milliliter", "milliliters", "ml",
  "liter", "liters", "litre", "litres", "l",
  "pint", "pints", "quart", "quarts", "gallon", "gallons",
  "pinch", "pinches", "dash", "dashes",
];

// COUNT / purchasable units — keep these as the shopping quantity.
const COUNT_UNITS = [
  "can", "cans", "jar", "jars", "bag", "bags", "box", "boxes",
  "bunch", "bunches", "head", "heads", "clove", "cloves",
  "package", "packages", "pack", "packs", "bottle", "bottles",
  "container", "containers", "loaf", "loaves", "dozen",
  "rib", "ribs", "ear", "ears", "stick", "sticks",
];

// Leading quantity: number (fraction/range/decimal/whole or unicode fraction)
// + optional unit word. \p{L} matches any letter incl. accented (ñ, é…).
const QUANTITY_REGEX =
  /^(\d+\s*\/\s*\d+|\d+\s*-\s*\d+|\d+\.\d+|\d+|[¼½¾⅓⅔⅛])\s*(\p{L}+)?\b/u;

export function parseRecipe(text: string): ParsedIngredient[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map(parseLine)
    .filter((p): p is ParsedIngredient => p !== null);
}

function parseLine(raw: string): ParsedIngredient | null {
  // Strip list markers: "- ", "* ", "• ", "1. "
  let cleaned = raw
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .trim();

  // Remove parenthetical / bracketed commentary
  cleaned = cleaned
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (cleaned.length === 0) return null;

  // Skip section headers: a short line ending in ":" with no digits
  // e.g. "Chicken broth:", "Soup:", "For the sauce:"
  if (/:$/.test(cleaned) && !/\d/.test(cleaned)) {
    return null;
  }

  const lower = cleaned.toLowerCase();

  const match = cleaned.match(QUANTITY_REGEX);

  let number: string | null = null;
  let unit: string | null = null;
  let name = cleaned;

  if (match) {
    number = match[1].trim();
    const maybeUnit = match[2] ? match[2].trim().toLowerCase() : null;
    const isKnownUnit =
      maybeUnit !== null &&
      (MEASURE_UNITS.includes(maybeUnit) || COUNT_UNITS.includes(maybeUnit));

    if (isKnownUnit) {
      unit = maybeUnit;
      name = cleaned.slice(match[0].length).trim();
    } else {
      unit = null;
      name = cleaned.slice(match[1].length).trim();
    }
  }

  // Only strip a leading "of" ("2 cups of flour" -> "flour").
  // NOTHING else is stripped — descriptors stay, commas stay.
  name = name.replace(/^of\s+/i, "").trim();

  // Capitalize first letter for tidiness
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  // --- Measure vs. count decision (only affects the QUANTITY, never the name) ---
  let quantity: string | null = null;
  let wasMeasure = false;

  if (number) {
    const isMeasure = unit !== null && MEASURE_UNITS.includes(unit);
    if (isMeasure) {
      quantity = null; // cooking measure — irrelevant for shopping
      wasMeasure = true;
    } else {
      // count unit, no unit, or unknown: keep it as the quantity
      quantity = unit ? `${number} ${unit}` : number;
    }
  }

  // Confidence: only flag genuinely empty results now. We keep everything,
  // so "long" is no longer a problem — the human trims in review.
  const emptyName = name.length === 0;
  const confident = !emptyName;

  return { raw, name, quantity, wasMeasure, confident };
}