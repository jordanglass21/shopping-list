// Maps keywords to category name. Longest (most specific) match wins.
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Produce": [
    "apple", "banana", "orange", "lemon", "lime", "grape", "berry", "berries",
    "strawberry", "blueberry", "raspberry", "blackberry", "melon", "watermelon",
    "cantaloupe", "peach", "pear", "plum", "mango", "pineapple", "kiwi", "cherry",
    "cherries", "avocado", "lettuce", "spinach", "kale", "arugula", "cabbage",
    "broccoli", "cauliflower", "carrot", "celery", "cucumber", "zucchini",
    "squash", "butternut", "eggplant", "tomato", "potato", "sweet potato",
    "onion", "garlic", "ginger", "pepper", "jalapeno", "mushroom", "corn",
    "peas", "green bean", "asparagus", "brussels sprout", "radish", "beet",
    "turnip", "leek", "scallion", "shallot", "cilantro", "parsley", "basil",
    "mint", "thyme", "rosemary", "herb", "salad",
  ],
  "Bakery": [
    "bread", "bagel", "bun", "roll", "croissant", "muffin", "tortilla", "pita",
    "baguette", "loaf", "sourdough", "ciabatta", "focaccia", "donut", "doughnut",
    "cake", "cupcake", "pastry", "brioche", "naan", "biscuit", "scone",
  ],
  "Meat & Seafood": [
    "chicken", "beef", "pork", "steak", "bacon", "sausage", "turkey", "fish",
    "salmon", "tuna", "shrimp", "ham", "lamb", "veal", "ribs", "brisket",
    "tenderloin", "cod", "tilapia", "crab", "lobster", "scallop", "clam",
    "mussel", "oyster", "hot dog", "deli", "prosciutto", "pepperoni", "chorizo",
    "ground beef", "ground turkey", "ground pork", "ground chicken", "jerky",
  ],
  "Dairy & Eggs": [
    "milk", "cheese", "butter", "yogurt", "egg", "cream", "sour cream",
    "cottage cheese", "cream cheese", "mozzarella", "cheddar", "parmesan",
    "feta", "brie", "gouda", "ricotta", "half and half", "heavy cream",
    "whipped cream", "margarine", "ghee", "kefir",
  ],
  "Frozen": [
    "frozen", "ice cream", "popsicle", "pizza", "sherbet", "gelato", "waffle",
    "ice cube",
  ],
  "Pantry": [
    "flour", "sugar", "rice", "pasta", "noodle", "beans", "lentil", "oil",
    "olive oil", "vinegar", "sauce", "soup", "cereal", "oats", "oatmeal",
    "salt", "spice", "canned", "honey", "syrup", "maple syrup", "peanut butter",
    "almond butter", "jam", "jelly", "ketchup", "mustard", "mayo", "mayonnaise",
    "salsa", "broth", "stock", "chicken broth", "beef broth", "vegetable broth",
    "chicken stock", "canned tomato", "canned beans", "canned corn",
    "tomato sauce", "tomato paste", "baking soda", "baking powder", "yeast",
    "cornstarch", "breadcrumb", "crouton", "granola", "quinoa", "couscous",
    "spaghetti", "macaroni", "ramen", "stuffing", "gravy", "bouillon",
    "molasses", "tahini", "soy sauce", "hot sauce", "sriracha", "relish",
    "pickle", "raisin", "coconut milk",
  ],
  "Snacks": [
    "chips", "crackers", "cookies", "candy", "chocolate", "popcorn", "pretzel",
    "nuts", "almonds", "cashews", "walnuts", "peanuts", "granola bar",
    "potato chips", "tortilla chips", "milk chocolate", "graham", "trail mix",
    "fruit snack", "gummy", "gum",
  ],
  "Beverages": [
    "water", "juice", "soda", "coffee", "tea", "beer", "wine", "seltzer",
    "sparkling water", "chocolate milk", "hot chocolate", "iced tea",
    "lemonade", "cola", "energy drink", "sports drink", "gatorade", "kombucha",
    "cider", "espresso", "latte", "smoothie", "orange juice", "apple juice",
    "coconut water",
  ],
  "Household": [
    "paper towel", "toilet paper", "detergent", "soap", "shampoo", "conditioner",
    "sponge", "trash bag", "foil", "aluminum foil", "dish soap", "dish detergent",
    "cleaner", "bleach", "laundry", "paper plate", "napkin", "tissue",
    "plastic wrap", "ziploc", "sandwich bag", "toothpaste", "deodorant",
    "lotion", "hand sanitizer", "batteries", "light bulb", "floss", "diaper",
    "wipes",
  ],
};

export function guessCategory(itemName: string): string {
  const lower = itemName.toLowerCase();
  let bestCategory = "Other";
  let bestLength = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw) && kw.length > bestLength) {
        bestLength = kw.length;
        bestCategory = category;
      }
    }
  }

  return bestCategory;
}