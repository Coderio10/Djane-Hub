// src/data/products.js
// This is your product catalogue — the single source of truth.
// In Phase 4 (backend), this moves to Supabase. For now, it lives here.

export const journals = [
  {
    id: "journal-classic",
    name: "Classic Journal",
    description: "A clean, timeless journal for everyday writing.",
    basePrice: 3500,
    colors: ["#1C1917", "#78350F", "#DC2626", "#1D4ED8", "#166534", "#FEF3C7"],
    colorNames: ["Midnight Black", "Warm Brown", "Deep Red", "Royal Blue", "Forest Green", "Cream"],
    image: "https://images.unsplash.com/photo-1544816565-c7dd5cc1e3da?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "journal-premium",
    name: "Premium Hardcover",
    description: "Thick pages, lay-flat binding, built to last.",
    basePrice: 4500,
    colors: ["#1C1917", "#78350F", "#7C3AED", "#0F766E"],
    colorNames: ["Midnight Black", "Warm Brown", "Royal Purple", "Teal"],
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "journal-pocket",
    name: "Pocket Journal",
    description: "Compact size, fits anywhere. Great for on-the-go notes.",
    basePrice: 2500,
    colors: ["#1C1917", "#DC2626", "#1D4ED8", "#FEF3C7"],
    colorNames: ["Midnight Black", "Deep Red", "Royal Blue", "Cream"],
    image: "https://images.unsplash.com/photo-1506880135364-e28660dc35fa?auto=format&fit=crop&w=900&q=80",
  },
]

export const tshirts = [
  {
    id: "tee-classic-white",
    name: "Classic White Tee",
    description: "100% cotton, premium weight. A wardrobe staple.",
    basePrice: 5000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#FFFFFF", "#1C1917", "#DC2626", "#1D4ED8"],
    colorNames: ["White", "Black", "Red", "Blue"],
    image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "tee-oversized",
    name: "Oversized Tee",
    description: "Relaxed fit, dropped shoulders. The streetwear essential.",
    basePrice: 6000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#FFFFFF", "#1C1917", "#6B7280", "#78350F"],
    colorNames: ["White", "Black", "Ash Grey", "Brown"],
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "tee-polo",
    name: "Polo Tee",
    description: "Smart casual. Works for lectures and meetings alike.",
    basePrice: 6500,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#FFFFFF", "#1C1917", "#166534", "#1D4ED8"],
    colorNames: ["White", "Black", "Green", "Blue"],
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=900&q=80",
  },
]