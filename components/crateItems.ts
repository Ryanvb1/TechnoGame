// Curated pool of niche, well-reviewed finds — the kind of thing you don't
// stumble across by accident, but people who do own one won't shut up about.
// See CRATE-NOTES.md at the repo root for sourcing/rationale and how to
// edit this list.
export type DailyItem = {
  name: string;
  brand: string;
  price: string;
  blurb: string;
  href: string;
};

export const CRATE_ITEMS: DailyItem[] = [
  {
    name: "Origin Embassy Pen",
    brand: "Maratac / CountyComm",
    price: "$39.95",
    blurb:
      "A machined pocket pen out of the government-surplus gear world — practically unknown outside tactical/EDC circles, a cult favorite inside them.",
    href: "https://countycomm.com/products/aluminium-embassy-pen-rev-3",
  },
  {
    name: "Bolt Action Pen",
    brand: "Tactile Turn",
    price: "$99",
    blurb:
      "Hand-machined in a small Dallas shop; 2,600+ reviews at 4.7 stars from a tiny “pen community” most people don't know exists.",
    href: "https://tactileturn.com/products/bolt-action-pen",
  },
  {
    name: "HeatBank 9s Hand Warmer",
    brand: "Zippo",
    price: "$49.95",
    blurb:
      "Everyone knows Zippo for lighters — almost no one knows they make this rechargeable hand warmer/power bank combo cold-weather regulars swear by.",
    href: "https://zippo.com/products/heatbank-9s-rechargeable-hand-warmer-box",
  },
  {
    name: "GeoPress Purifier Bottle",
    brand: "Grayl",
    price: "$99.95",
    blurb:
      "Press it like a French press and 24oz of contaminated water is drinkable in 8 seconds — a quiet legend among backpackers, unheard of outside that world.",
    href: "https://grayl.com/collections/geopress",
  },
  {
    name: "Encore Grinder",
    brand: "Baratza",
    price: "$149.95",
    blurb:
      "The grinder every home-coffee forum recommends to beginners before any other purchase — invisible if you've never gone down that rabbit hole.",
    href: "https://baratza.com/grinder/encore/",
  },
  {
    name: "P-51 Can Opener",
    brand: "Rothco (G.I. spec)",
    price: "~$3",
    blurb:
      "A 2-inch stamped-steel WWII design that still outperforms modern openers — a couple bucks, and camping/prepper forums treat it like folklore.",
    href: "https://www.rothco.com/product/Rothco-gi-type-p-51-can-opener",
  },
  {
    name: "Shard Keychain Tool",
    brand: "Gerber",
    price: "$7.99",
    blurb:
      "A 7-in-1 keychain tool EDC forums recommend on repeat — cheap enough to ignore, useful enough that owners never take it off their keys.",
    href: "https://www.gerbergear.com/en-us/shop/knives/all-knives/shard-22-01769n",
  },
  {
    name: "No. 393 All-Weather Notebook",
    brand: "Rite in the Rain",
    price: "$7.95",
    blurb:
      "Waterproof paper surveyors, linemen, and search-and-rescue crews have relied on for decades — most desks have never seen one.",
    href: "https://www.riteintherain.com/top-spiral-notebooks",
  },
  {
    name: "Skoy Cloth (4-pack)",
    brand: "Skoy",
    price: "$8",
    blurb:
      "A Swedish-style dishcloth that replaces roughly 15 rolls of paper towels; a tiny eco-brand with near-cult devotion from anyone who tries it.",
    href: "https://eartheasy.com/skoy-eco-cleaning-cloth-4-pack/",
  },
];

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

// Picks 3 consecutive items from the pool, rotating one step further into
// the list each calendar day (wrapping around) — a fresh-feeling daily
// drop with no backend/database involved.
export function getDailyCrateItems(date: Date = new Date()): DailyItem[] {
  const start = dayOfYear(date) % CRATE_ITEMS.length;
  return [0, 1, 2].map((i) => CRATE_ITEMS[(start + i) % CRATE_ITEMS.length]);
}
