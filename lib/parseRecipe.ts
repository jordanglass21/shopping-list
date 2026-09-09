export type ParsedIngredient = {
    raw: string; // the original line, always kept
    name: string; // best guess at the item to buy
    quantity: string | null; // shopping quantity 
    wasMeasure: boolean; // did we drop a cooking measure? (for review transparency)
    confident: boolean; // did we trust our own parse?
};

// Cooking MEASURES — if the quantity uses one of these units, it's irrelevant
// for shopping
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
    "stick", "sticks",
];

// COUNT/PURCHASABLE units — a number with one of these  is a real shopping
// quantity we keep. e.g. "2 onions", "1 can", "3 cloves".
const COUNT_UNITS = [
    "can", "cans", "jar", "jars", "bag", "bags", "box", "boxes",
    "bunch", "bunches", "head", "heads", "clove", "cloves",
    "package", "packages", "pack", "packs", "bottle", "bottles",
    "container", "containers", "loaf", "loaves", "dozen",
];

// Preparation / descriptor words that are irrelevant for shopping.
const PREP_WORDS = [
    "finely chopped", "roughly chopped", "thinly sliced", "for frying",
    "for garnish", "for serving", "for dusting", "for greasing",
    "room temperature", "at room temperature", "cut into chunks",
    "cut into pieces", "chopped", "diced", "sliced", "minced", "grated",
    "shredded", "crushed", "peeled", "beaten", "softened", "melted",
    "cubed", "julienned", "halved", "quartered", "trimmed", "deseeded",
    "seeded", "drained", "rinsed", "cooked", "uncooked", "fresh",
    "frozen", "dried", "ground", "whole", "boneless", "skinless",
    "ripe", "large", "medium", "small", "extra", "organic",
    "finely", "roughly", "thinly", "thick", "thin",
];

// Words / phrases that signal a line is fuzzy / hard to parse cleanly.
const FUZZY_WORDS = [
    "to taste", "optional", "or ", "about", "handful",
    "as needed", "plus more", "if needed", "such as",
    "your choice", "any ", "few ",
];

// Fuzzy leading quantities that aren't clean numbers
const FUZZY_QUANTITY_PREFIXES = [
    "half a", "half an", "a few", "a couple", "couple of",
    "a handful", "handful of", "some ",
];

// Leading quantity: number (fraction/range/decimal/whole) + optional unit word.
// Handles "500ml" (no space) as well as "2 cups".
const QUANTITY_REGEX =
    /^(\d+\s*\/\s*\d+|\d+\s*-\s*\d+|\d+\.\d+|\d+)\s*([a-zA-Z]+)?\b/;

export function parseRecipe(text: string): ParsedIngredient[] {
    return text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map(parseLine);
}

function parseLine(raw: string): ParsedIngredient {
    // Strip list markers: "- ", "* ", "• ", "1. "
    let cleaned = raw
        .replace(/^[-*•]\s*/, "")
        .replace(/^\d+\.\s*/, "")
        .trim();

    // Remove any parenthetical or bracketed commentary:
    // "potatoes (this type melts in the mouth)" -> "potatoes"
    cleaned = cleaned
        .replace(/\([^)]*\)/g, "")
        .replace(/\[[^\]]*\]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    const lower = cleaned.toLowerCase();
    const hadFuzzyQuantity = FUZZY_QUANTITY_PREFIXES.some((p) =>
        lower.startsWith(p)
    );

    const match = cleaned.match(QUANTITY_REGEX);

    let number: string | null = null;
    let unit: string | null = null;
    let name = cleaned;

    if (match) {
        number = match[1].trim(); // e.g. "2", "1/2", "2-3", "500"
        unit = match[2] ? match[2].trim().toLowerCase() : null; // "cups", "ml", "cloves"…
        name = cleaned.slice(match[0].length).trim();
    }

    // "2 cups of flour" -> drop leading "of"
    name = name.replace(/^of\s+/i, "").trim();
    // Cut anything after a comma: "onion, finely chopped" -> "onion"
    name = name.split(",")[0].trim();
    // Strip preparation/descriptor words anywhere in the name
    name = stripPrepWords(name);
    if (name.length > 0) {
        name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    // --- Measure vs. count decision ---
    let quantity: string | null = null;
    let wasMeasure = false;

    if (number) {
        const isMeasure = unit !== null && MEASURE_UNITS.includes(unit);
        const isCount = unit === null || COUNT_UNITS.includes(unit);

        if (isMeasure) {
            quantity = null; // cooking measure — irrelevant for shopping
            wasMeasure = true;
        } else if (isCount) {
            quantity = unit ? `${number} ${unit}` : number;
        } else {
            quantity = unit ? `${number} ${unit}` : number; // unknown unit — keep, flag below
        }
    }

    // Confidence heuristics
    const hasFuzzyWord = FUZZY_WORDS.some((w) => lower.includes(w));
    const tooLong = name.split(" ").filter(Boolean).length > 4;
    const emptyName = name.length === 0;
    const unknownUnit =
        unit !== null &&
        !MEASURE_UNITS.includes(unit) &&
        !COUNT_UNITS.includes(unit);
    const noNumber = number === null;

    const confident =
        !hasFuzzyWord &&
        !hadFuzzyQuantity &&
        !tooLong &&
        !emptyName &&
        !unknownUnit &&
        !noNumber;

    return { raw, name, quantity, wasMeasure, confident };
}

// Remove prep/descriptor words from a name, longest phrases first.
function stripPrepWords(name: string): string {
    const original = name;
    let result = ` ${name.toLowerCase()} `;

    // Sort by length so multi-word phrases are removed before single words.
    const sorted = [...PREP_WORDS].sort((a, b) => b.length - a.length);
    for (const word of sorted) {
        result = result.split(` ${word} `).join(" ");
    }
    result = result.replace(/\s{2,}/g, " ").trim();

    if (result.length === 0) return original;

    // Re-extract surviving words from the original to preserve casing/order.
    const survivors = new Set(result.split(" "));
    const kept = original
        .split(" ")
        .filter((w) => survivors.has(w.toLowerCase().replace(/[.,]/g, "")));
    return kept.length > 0 ? kept.join(" ") : result;
}