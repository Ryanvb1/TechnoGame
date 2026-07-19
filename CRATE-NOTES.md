# Daily Crate — item picks

You asked for the crate room to link to niche, hard-to-stumble-on items that
are extremely respected by the people who found them — not Amazon top-5
listicle stuff. Given your answers (general EDC/gadgets/home goods, a static
list I curate, daily rotation, plain links for now), here's what's live and
how it works.

## How the rotation works

`components/crateItems.ts` holds a flat pool of items (`CRATE_ITEMS`).
`getDailyCrateItems()` picks 3 consecutive items from that pool based on the
day of the year, wrapping around — so the crate shows a fresh-feeling trio
every day with zero backend/database. With 9 items in the pool, the full
rotation repeats every 9 days.

**To edit the list:** just add/remove/reorder entries in `CRATE_ITEMS`. Each
entry is `{ name, brand, price, blurb, href }` — no other code needs to
change.

## The 9 picks, and why I chose them

Each of these turned up in my research as something a specific niche
community treats as a known-good staple, while general awareness of it
outside that niche is low — that's the "hard to stumble across, respected by
whoever finds it" bar you set.

1. **Origin Embassy Pen** (Maratac/CountyComm, $39.95) — CountyComm sells
   government-surplus-style gear to the tactical/prepper EDC crowd; this
   pocket pen is one of their signature pieces.
2. **Bolt Action Pen** (Tactile Turn, $99) — a small Dallas machine shop;
   2,600+ reviews at 4.7★ from the "pen community" (yes, that's a real
   niche — see r/pens).
3. **HeatBank 9s Hand Warmer** (Zippo, $49.95) — most people only know Zippo
   for lighters; this rechargeable hand-warmer/power-bank is well-reviewed
   and virtually unknown outside outdoor/cold-weather circles.
4. **GeoPress Purifier Bottle** (Grayl, $99.95) — a press-to-purify water
   bottle that's a quiet legend among backpackers and preppers.
5. **Encore Grinder** (Baratza, $149.95) — the grinder every home-coffee
   forum tells beginners to buy first; invisible if you've never been
   pointed at r/coffee.
6. **P-51 Can Opener** (Rothco/G.I. spec, ~$3) — a tiny stamped-steel WWII
   design, a couple bucks, treated like folklore in camping/military circles.
7. **Shard Keychain Tool** (Gerber, $7.99) — a 7-in-1 keychain multitool EDC
   forums recommend constantly.
8. **No. 393 All-Weather Notebook** (Rite in the Rain, $7.95) — waterproof
   paper surveyors/linemen/SAR crews have used for decades.
9. **Skoy Cloth 4-pack** (Skoy, $8) — a small eco-brand dishcloth with
   near-cult devotion from anyone who's tried it.

## Caveats / things to double-check

- **Prices will drift.** These are what each brand's site listed as of this
  session (July 2026) — worth a periodic spot-check since I hardcoded the
  price text rather than pulling it live (no backend, per your v1 rules).
- **Links go to a mix of the brand's own site and one third-party retailer**
  (Rothco for the P-51 opener, Eartheasy for the Skoy Cloth) where I couldn't
  confirm a clean official product page. Swap these if you have a preferred
  retailer or affiliate program for either.
- **No affiliate links yet** — these are all plain links, per your answer.
  When you're ready to monetize, the `href` field is the only thing that
  needs to change per item.
- **Category is "general EDC/gadgets/home goods."** If you'd rather tie the
  crate back into the site's nicotine/self-improvement theme instead, that's
  a easy swap of `CRATE_ITEMS` — just say the word.
