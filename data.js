/* Raha Restaurant — central product data.
   Prices and product names come from the existing Raha menu (KES).
   Image paths use the existing image files shipped with the site. */

window.RAHA = window.RAHA || {};

RAHA.contact = {
  phoneDisplay: "+254 700 547 456",
  phoneHref: "tel:+254700547456",
  orderPhoneDisplay: "+254 791 511 386",
  orderPhoneHref: "tel:+254791511386",
  whatsapp: "254791511386",
  address: "Nyali, Mombasa, Kenya",
  hours: "Daily 10 AM – 11 PM",
  maps: "https://www.google.com/maps/search/?api=1&query=Raha+Restaurant+Nyali+Mombasa",
};

RAHA.categories = [
  { id: "all", label: "All" },
  { id: "chicken", label: "Chicken" },
  { id: "burgers", label: "Burgers" },
  { id: "seafood", label: "Seafood" },
  { id: "sides", label: "Sides" },
  { id: "drinks", label: "Drinks" },
];

RAHA.products = [
  {
    id: "signature-broast-chicken",
    name: "Signature Broast Chicken",
    desc: "8 pieces, perfectly seasoned & crispy.",
    price: 950,
    cats: ["chicken"],
    image: "Signature Broast Chicken.png",
    bestseller: true,
  },
  {
    id: "chicken-fillet-burger",
    name: "Chicken Fillet Burger",
    desc: "Juicy fillet, garlic sauce, fresh bun.",
    price: 420,
    cats: ["chicken", "burgers"],
    image: "Chicken Fillet Burger.png",
    bestseller: true,
  },
  {
    id: "chicken-4-piece-meal",
    name: "4-Piece Chicken Meal",
    desc: "With fries, coleslaw & garlic sauce.",
    price: 650,
    cats: ["chicken"],
    image: "4-Piece Chicken Meal.png",
    bestseller: true,
  },
  {
    id: "grilled-chicken",
    name: "Grilled Chicken",
    desc: "Light, flame-grilled with herb marinade.",
    price: 750,
    cats: ["chicken"],
    image: "grilled chicken.png",
  },
  {
    id: "jumbo-shrimp-meal",
    name: "Jumbo Shrimp Meal",
    desc: "12 pieces with cocktail sauce & fries.",
    price: 1100,
    cats: ["seafood"],
    image: "Jumbo Shrimp Meal.png",
    bestseller: true,
  },
  {
    id: "crispy-fries",
    name: "Crispy Fries",
    desc: "Golden, seasoned, freshly fried.",
    price: 180,
    cats: ["sides"],
    image: "crispy fries.jpg",
    bestseller: true,
  },
  {
    id: "coleslaw-salad",
    name: "Coleslaw Salad",
    desc: "Creamy homemade coleslaw.",
    price: 120,
    cats: ["sides"],
    image: "COLESAW.jpg",
  },
  {
    id: "fresh-lemonade",
    name: "Fresh Lemonade",
    desc: "Squeezed daily, hint of mint.",
    price: 200,
    cats: ["drinks"],
    image: "Fresh Lemonade.png",
  },
  {
    id: "mango-juice",
    name: "Mango Juice",
    desc: "100% fresh-blended mango.",
    price: 220,
    cats: ["drinks"],
    image: "Mango.png",
  },
  {
    id: "mirinda",
    name: "Mirinda",
    desc: "Mirinda — ice cold.",
    price: 80,
    cats: ["drinks"],
    image: "mirinda.png",
  },
  {
    id: "7up",
    name: "7Up Ice Cold",
    desc: "7Up — ice cold.",
    price: 80,
    cats: ["drinks"],
    image: "7up drink.png",
  },
];

/* Combos are bundles of real menu items. The price shown is the sum of the
   individual item prices — no invented discounts or claims. */
RAHA.deals = [
  {
    id: "solo-deal",
    kicker: "Solo Deal",
    name: "Burger + Fries + Drink",
    items: ["chicken-fillet-burger", "crispy-fries", "7up"],
  },
  {
    id: "chicken-plate-deal",
    kicker: "Chicken Plate",
    name: "4-Piece Meal + Lemonade",
    items: ["chicken-4-piece-meal", "fresh-lemonade"],
  },
  {
    id: "family-feast",
    kicker: "Family Feast",
    name: "Broast Chicken + Fries + Coleslaw",
    items: ["signature-broast-chicken", "crispy-fries", "crispy-fries", "coleslaw-salad"],
  },
];

RAHA.heroSlides = [
  {
    image: "4-Piece Chicken Meal.png",
    alt: "4-Piece broasted chicken meal with fries and coleslaw",
    eyebrow: "Nyali, Mombasa · Since 2010",
    title: "Mombasa's Crispy <span>Chicken Fix</span>",
    sub: "Freshly prepared. Crispy. Hot. Pure Raha — ordered in seconds on WhatsApp.",
  },
  {
    image: "Chicken Fillet Burger.png",
    alt: "Chicken fillet burger with garlic sauce",
    eyebrow: "Fan Favourite",
    title: "Chicken Fillet <span>Burger</span>",
    sub: "Juicy fillet, creamy garlic sauce, fresh-baked bun. KES 420.",
  },
  {
    image: "Jumbo Shrimp Meal.png",
    alt: "Jumbo shrimp meal with cocktail sauce and fries",
    eyebrow: "From the Sea",
    title: "Jumbo Shrimp <span>Meal</span>",
    sub: "Twelve hand-picked shrimp, golden-fried with cocktail sauce and fries. KES 1,100.",
  },
];

RAHA.money = (n) => "KES " + Number(n).toLocaleString("en-KE");
