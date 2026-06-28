/**
 * A compact, multi-cuisine food knowledge base used by the offline heuristic
 * provider. Values are approximate per-100g of the COOKED, ready-to-eat food.
 * This is intentionally a local dataset so the analyzer works with no API key;
 * a real vision/USDA provider can later supply richer data behind the same
 * `FoodAnalysisProvider` contract.
 */

import type { ComponentRole, Nutrition } from "./types";

export interface FoodItem {
  id: string;
  name: string;
  /** Lowercase match tokens (the description is scanned for these). */
  aliases: string[];
  role: ComponentRole;
  per100g: Nutrition;
  /** Typical grams in one standard serving. */
  servingG: number;
  /** Optional human serving label, e.g. "1 roti", "1 bowl". */
  servingLabel?: string;
  cuisine?: string;
  method?: string;
  /** Zero-calorie spices/aromatics shown as "detected" for this dish. */
  aromatics?: string[];
}

/** Terse constructor: per-100g nutrition. */
function n(
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  sugar: number,
  sodium: number,
  potassium: number,
): Nutrition {
  return { calories, protein, carbs, fat, fiber, sugar, sodium, potassium };
}

export const FOODS: FoodItem[] = [
  // ---- Indian staples ----
  { id: "rice", name: "Steamed Rice", aliases: ["rice", "chawal", "steamed rice", "white rice", "basmati"], role: "rice", per100g: n(130, 2.7, 28, 0.3, 0.4, 0.1, 1, 35), servingG: 180, servingLabel: "1 cup", cuisine: "Indian", method: "boiled" },
  { id: "dal", name: "Dal (Lentil Curry)", aliases: ["dal", "daal", "dhal", "lentil", "toor dal", "moong dal", "tadka"], role: "main", per100g: n(118, 6, 16, 3.4, 4.2, 1.2, 320, 260), servingG: 160, servingLabel: "1 bowl", cuisine: "Indian", method: "simmered", aromatics: ["Cumin", "Coriander", "Turmeric", "Garlic"] },
  { id: "roti", name: "Roti / Chapati", aliases: ["roti", "rotis", "chapati", "chapatti", "phulka", "fulka"], role: "bread", per100g: n(297, 8, 50, 7, 6, 1.5, 280, 130), servingG: 40, servingLabel: "1 roti", cuisine: "Indian", method: "griddled" },
  { id: "naan", name: "Naan", aliases: ["naan", "butter naan", "garlic naan"], role: "bread", per100g: n(310, 9, 50, 8, 2.2, 3, 450, 110), servingG: 90, servingLabel: "1 naan", cuisine: "Indian", method: "baked" },
  { id: "paratha", name: "Paratha", aliases: ["paratha", "parantha", "aloo paratha"], role: "bread", per100g: n(326, 7, 42, 14, 4, 2, 360, 140), servingG: 60, servingLabel: "1 paratha", cuisine: "Indian", method: "pan-fried" },
  { id: "paneer-butter-masala", name: "Paneer Butter Masala", aliases: ["paneer butter masala", "paneer makhani", "shahi paneer", "butter paneer"], role: "main", per100g: n(245, 9, 9, 19, 1.8, 5, 480, 180), servingG: 200, servingLabel: "1 bowl", cuisine: "Indian", method: "simmered in gravy", aromatics: ["Tomato", "Cream", "Garam Masala", "Butter"] },
  { id: "palak-paneer", name: "Palak Paneer", aliases: ["palak paneer", "saag paneer", "spinach paneer"], role: "main", per100g: n(180, 9, 7, 13, 3, 2.5, 420, 280), servingG: 200, cuisine: "Indian", method: "simmered", aromatics: ["Spinach", "Garlic", "Ginger"] },
  { id: "paneer", name: "Paneer", aliases: ["paneer", "cottage cheese"], role: "protein", per100g: n(265, 18, 1.2, 21, 0, 1.2, 18, 100), servingG: 100, cuisine: "Indian" },
  { id: "chole", name: "Chole (Chickpea Curry)", aliases: ["chole", "chana masala", "chickpea curry", "chana"], role: "main", per100g: n(180, 8, 22, 6, 6, 4, 420, 290), servingG: 180, cuisine: "Indian", aromatics: ["Onion", "Tomato", "Garam Masala"] },
  { id: "rajma", name: "Rajma (Kidney Beans)", aliases: ["rajma", "kidney bean", "kidney beans"], role: "main", per100g: n(140, 7, 20, 3.5, 6.5, 3, 380, 320), servingG: 180, cuisine: "Indian" },
  { id: "dal-makhani", name: "Dal Makhani", aliases: ["dal makhani", "dal makhni", "maa ki dal"], role: "main", per100g: n(230, 8, 18, 14, 5, 2, 460, 300), servingG: 180, cuisine: "Indian", aromatics: ["Cream", "Butter", "Tomato"] },
  { id: "chicken-biryani", name: "Chicken Biryani", aliases: ["chicken biryani", "biryani", "biriyani", "dum biryani"], role: "main", per100g: n(190, 9, 22, 7.5, 1.5, 1, 420, 180), servingG: 300, servingLabel: "1 plate", cuisine: "Indian", method: "dum-cooked", aromatics: ["Saffron", "Fried Onion", "Whole Spices", "Mint"] },
  { id: "veg-biryani", name: "Vegetable Biryani", aliases: ["veg biryani", "vegetable biryani"], role: "main", per100g: n(170, 4, 26, 6, 2.5, 2, 380, 200), servingG: 300, cuisine: "Indian" },
  { id: "butter-chicken", name: "Butter Chicken", aliases: ["butter chicken", "murgh makhani", "chicken makhani"], role: "main", per100g: n(190, 13, 6, 13, 1, 4, 470, 220), servingG: 220, cuisine: "Indian", aromatics: ["Tomato", "Cream", "Butter"] },
  { id: "chicken-curry", name: "Chicken Curry", aliases: ["chicken curry", "chicken masala", "murgh"], role: "main", per100g: n(150, 14, 5, 8.5, 1.2, 2, 430, 240), servingG: 220, cuisine: "Indian" },
  { id: "idli", name: "Idli", aliases: ["idli", "idly"], role: "main", per100g: n(135, 4, 28, 0.5, 1, 0.4, 200, 70), servingG: 80, servingLabel: "2 idli", cuisine: "South Indian", method: "steamed" },
  { id: "dosa", name: "Dosa", aliases: ["dosa", "masala dosa", "plain dosa"], role: "main", per100g: n(168, 4, 28, 4.5, 1.5, 0.6, 260, 90), servingG: 120, cuisine: "South Indian", method: "griddled" },
  { id: "sambar", name: "Sambar", aliases: ["sambar", "sambhar"], role: "side", per100g: n(85, 4, 12, 2.5, 3, 2, 360, 240), servingG: 150, cuisine: "South Indian" },
  { id: "khichdi", name: "Khichdi", aliases: ["khichdi", "khichri", "khichadi"], role: "main", per100g: n(120, 5, 18, 3, 2.5, 0.8, 320, 160), servingG: 220, cuisine: "Indian" },
  { id: "poha", name: "Poha", aliases: ["poha", "pohe", "flattened rice"], role: "main", per100g: n(130, 2.5, 24, 3, 1.5, 1.5, 280, 90), servingG: 150, cuisine: "Indian" },
  { id: "upma", name: "Upma", aliases: ["upma", "uppma"], role: "main", per100g: n(150, 3.5, 22, 5, 1.8, 1, 320, 80), servingG: 150, cuisine: "South Indian" },
  { id: "samosa", name: "Samosa", aliases: ["samosa", "samosas"], role: "snack", per100g: n(262, 5, 32, 13, 3, 2, 420, 160), servingG: 60, servingLabel: "1 samosa", cuisine: "Indian", method: "deep-fried" },
  // ---- Gujarati ----
  { id: "dhokla", name: "Dhokla / Khaman", aliases: ["dhokla", "khaman", "khaman dhokla"], role: "snack", per100g: n(160, 6, 22, 5, 2, 4, 380, 130), servingG: 120, cuisine: "Gujarati", method: "steamed" },
  { id: "thepla", name: "Thepla", aliases: ["thepla", "theplas"], role: "bread", per100g: n(300, 7, 40, 12, 5, 2, 350, 160), servingG: 45, servingLabel: "1 thepla", cuisine: "Gujarati" },
  { id: "undhiyu", name: "Undhiyu", aliases: ["undhiyu", "undhiya"], role: "main", per100g: n(180, 4, 18, 11, 5, 4, 360, 320), servingG: 180, cuisine: "Gujarati" },
  // ---- Chinese ----
  { id: "fried-rice", name: "Fried Rice", aliases: ["fried rice", "veg fried rice", "egg fried rice"], role: "rice", per100g: n(165, 4, 26, 5, 1.5, 1.5, 480, 110), servingG: 250, cuisine: "Chinese", method: "stir-fried" },
  { id: "hakka-noodles", name: "Hakka Noodles", aliases: ["noodles", "hakka noodles", "chow mein", "chowmein"], role: "main", per100g: n(180, 5, 28, 6, 2, 2, 520, 130), servingG: 250, cuisine: "Chinese", method: "stir-fried" },
  { id: "manchurian", name: "Manchurian", aliases: ["manchurian", "gobi manchurian", "veg manchurian"], role: "side", per100g: n(180, 4, 20, 9, 2, 5, 620, 180), servingG: 180, cuisine: "Chinese", method: "deep-fried + sauce" },
  // ---- Italian ----
  { id: "pasta", name: "Pasta", aliases: ["pasta", "penne", "spaghetti", "macaroni"], role: "main", per100g: n(158, 5.8, 31, 0.9, 1.8, 0.6, 6, 44), servingG: 250, cuisine: "Italian", method: "boiled" },
  { id: "veg-pasta", name: "Vegetable Pasta", aliases: ["vegetable pasta", "veg pasta", "pasta with vegetables", "primavera"], role: "main", per100g: n(150, 5, 24, 4.5, 2.5, 3, 320, 180), servingG: 300, cuisine: "Italian" },
  { id: "alfredo-pasta", name: "Alfredo Pasta", aliases: ["alfredo", "white sauce pasta", "creamy pasta"], role: "main", per100g: n(190, 6, 22, 9, 1.5, 2, 380, 120), servingG: 300, cuisine: "Italian" },
  { id: "pizza", name: "Pizza", aliases: ["pizza", "margherita", "pepperoni"], role: "main", per100g: n(266, 11, 33, 10, 2.3, 3.6, 600, 180), servingG: 125, servingLabel: "1 slice", cuisine: "Italian", method: "baked" },
  // ---- Mexican / Fast food ----
  { id: "burrito", name: "Burrito", aliases: ["burrito", "burritos"], role: "main", per100g: n(210, 8, 26, 8, 4, 2, 520, 220), servingG: 250, cuisine: "Mexican" },
  { id: "taco", name: "Taco", aliases: ["taco", "tacos"], role: "main", per100g: n(220, 9, 20, 11, 3, 2, 480, 200), servingG: 100, cuisine: "Mexican" },
  { id: "burger", name: "Burger", aliases: ["burger", "cheeseburger", "hamburger"], role: "main", per100g: n(254, 12, 26, 11, 1.6, 5, 480, 200), servingG: 200, servingLabel: "1 burger", cuisine: "Fast Food", method: "grilled" },
  { id: "fries", name: "French Fries", aliases: ["fries", "french fries", "chips"], role: "side", per100g: n(312, 3.4, 41, 15, 3.8, 0.3, 210, 580), servingG: 120, cuisine: "Fast Food", method: "deep-fried" },
  { id: "sandwich", name: "Sandwich", aliases: ["sandwich", "veg sandwich", "grilled sandwich"], role: "main", per100g: n(250, 9, 30, 10, 3, 4, 520, 180), servingG: 180, cuisine: "Cafe" },
  // ---- Protein / eggs / grilled ----
  { id: "eggs", name: "Eggs", aliases: ["egg", "eggs", "omelette", "omelet", "boiled egg", "scrambled"], role: "protein", per100g: n(155, 13, 1.1, 11, 0, 1.1, 124, 126), servingG: 100, servingLabel: "2 eggs", method: "cooked" },
  { id: "grilled-chicken", name: "Grilled Chicken", aliases: ["grilled chicken", "chicken breast", "chicken tikka", "tandoori chicken"], role: "protein", per100g: n(165, 31, 0, 3.6, 0, 0, 74, 256), servingG: 150, method: "grilled" },
  { id: "fish", name: "Fish", aliases: ["fish", "fish curry", "grilled fish", "salmon"], role: "protein", per100g: n(170, 22, 0, 9, 0, 0, 90, 360), servingG: 150 },
  // ---- Dairy / fruit / breakfast ----
  { id: "greek-yogurt", name: "Greek Yogurt", aliases: ["greek yogurt", "greek yoghurt"], role: "protein", per100g: n(59, 10, 3.6, 0.4, 0, 3.2, 36, 141), servingG: 150, servingLabel: "1 cup" },
  { id: "curd", name: "Curd / Dahi", aliases: ["curd", "dahi", "yogurt", "yoghurt", "raita"], role: "side", per100g: n(61, 3.5, 4.7, 3.3, 0, 4.7, 46, 155), servingG: 120 },
  { id: "banana", name: "Banana", aliases: ["banana"], role: "snack", per100g: n(89, 1.1, 23, 0.3, 2.6, 12, 1, 358), servingG: 120, servingLabel: "1 banana" },
  { id: "apple", name: "Apple", aliases: ["apple"], role: "snack", per100g: n(52, 0.3, 14, 0.2, 2.4, 10, 1, 107), servingG: 150 },
  { id: "oats", name: "Oats / Porridge", aliases: ["oats", "oatmeal", "porridge", "overnight oats"], role: "main", per100g: n(95, 3.5, 16, 2, 2.5, 3, 50, 90), servingG: 250 },
  // ---- Bakery / dessert ----
  { id: "gulab-jamun", name: "Gulab Jamun", aliases: ["gulab jamun", "gulab jamoon"], role: "dessert", per100g: n(300, 4, 42, 13, 0.5, 38, 80, 90), servingG: 50, servingLabel: "1 piece", cuisine: "Indian" },
  { id: "cake", name: "Cake", aliases: ["cake", "pastry", "brownie", "muffin"], role: "dessert", per100g: n(370, 5, 50, 17, 1, 35, 320, 90), servingG: 90, cuisine: "Bakery" },
  { id: "ice-cream", name: "Ice Cream", aliases: ["ice cream", "icecream", "kulfi"], role: "dessert", per100g: n(207, 3.5, 24, 11, 0.7, 21, 80, 200), servingG: 100 },
  // ---- Drinks ----
  { id: "smoothie", name: "Smoothie", aliases: ["smoothie", "fruit smoothie", "milkshake", "shake"], role: "drink", per100g: n(75, 2.5, 14, 1.2, 1.2, 11, 40, 200), servingG: 300 },
  { id: "protein-shake", name: "Protein Shake", aliases: ["protein shake", "whey", "protein drink"], role: "drink", per100g: n(60, 8, 4, 1.2, 0.5, 2, 70, 180), servingG: 350 },
  { id: "coffee", name: "Coffee (with milk)", aliases: ["coffee", "latte", "cappuccino", "cold coffee"], role: "drink", per100g: n(42, 1.6, 5.5, 1.6, 0, 5, 25, 90), servingG: 240 },
  { id: "tea", name: "Tea / Chai", aliases: ["tea", "chai", "masala chai"], role: "drink", per100g: n(48, 1.3, 7, 1.6, 0, 6.5, 20, 70), servingG: 200 },
  { id: "beer", name: "Beer", aliases: ["beer"], role: "drink", per100g: n(43, 0.5, 3.6, 0, 0, 0, 4, 27), servingG: 330 },
  { id: "wine", name: "Wine", aliases: ["wine", "red wine", "white wine"], role: "drink", per100g: n(83, 0.1, 2.6, 0, 0, 0.6, 5, 100), servingG: 150 },
  // ---- Vegetables / salad ----
  { id: "salad", name: "Garden Salad", aliases: ["salad", "green salad", "garden salad"], role: "vegetable", per100g: n(55, 2, 7, 2.5, 2.5, 3, 120, 240), servingG: 150 },
  { id: "mixed-veg", name: "Mixed Vegetable Sabzi", aliases: ["sabzi", "sabji", "mixed veg", "vegetable curry", "aloo gobi", "bhindi"], role: "vegetable", per100g: n(120, 3, 12, 7, 4, 4, 320, 280), servingG: 150, cuisine: "Indian" },
];

/** High-fat add-ons that the description can introduce (per gram already). */
export const FAT_ADDONS: Record<string, { name: string; per100g: Nutrition }> = {
  ghee: { name: "Ghee", per100g: n(900, 0, 0, 100, 0, 0, 0, 0) },
  butter: { name: "Butter", per100g: n(717, 0.9, 0.1, 81, 0, 0.1, 11, 24) },
  oil: { name: "Oil", per100g: n(884, 0, 0, 100, 0, 0, 0, 0) },
  cheese: { name: "Cheese", per100g: n(402, 25, 1.3, 33, 0, 0.5, 621, 98) },
};
