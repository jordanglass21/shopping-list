// Maps keywords to category name. First match wins.
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Produce": ["apple", "banana", "lettuce", "spinach", "tomato", "onion", "garlic", "potato", "carrot", "pepper", "lemon", "lime", "avocado", "broccoli", "cucumber", "berry", "berries", "grape", "orange", "celery", "mushroom", "kale", "cilantro", "herb"],
  "Bakery": ["bread", "bagel", "bun", "roll", "croissant", "muffin", "tortilla", "pita", "baguette"],
  "Meat & Seafood": ["chicken", "beef", "pork", "steak", "bacon", "sausage", "turkey", "fish", "salmon", "shrimp", "ground", "ham", "lamb"],
  "Dairy & Eggs": ["milk", "cheese", "butter", "yogurt", "egg", "cream", "sour cream", "cottage"],
  "Frozen": ["frozen", "ice cream", "pizza", "popsicle"],
  "Pantry": ["flour", "sugar", "rice", "pasta", "beans", "oil", "vinegar", "sauce", "soup", "cereal", "oats", "salt", "spice", "canned", "peanut butter", "honey", "broth", "stock"],
  "Snacks": ["chips", "crackers", "cookies", "candy", "chocolate", "popcorn", "pretzel", "nuts", "granola bar"],
  "Beverages": ["water", "juice", "soda", "coffee", "tea", "beer", "wine", "seltzer"],
  "Household": ["paper towel", "toilet paper", "detergent", "soap", "shampoo", "sponge", "trash bag", "foil", "dish", "cleaner"],
};

export function guessCategory(itemName: string): string {
  const lower = itemName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "Other"; // fallback
}