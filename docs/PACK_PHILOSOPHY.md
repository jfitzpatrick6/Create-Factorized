# Pack Philosophy — NeoForge 1.21.1 Create Modpack

Living design document for planning recipes, quests, and balance. Update this when major decisions are made.

**Repo:** [jfitzpatrick6/neoforge-1.21.1-modpack](https://github.com/jfitzpatrick6/neoforge-1.21.1-modpack)  
**Planning epic:** GitHub #2

---

## Vision

A **Create-first industrial modpack** for a **small friend server** (2–5 players) where the factory *is* the progression. Players scale from andesite machines through steel chemistry, oil refining, electronics, and full automation — while exploring Terralith/Tectonic terrain and building large, expressive bases over **endless play**.

There is no hard “you win” screen. The intended long-term fantasy is a **sustainable megabase**: automated ore and stone, diesel/CNA power, pretty factories, and optional toys (guns, cannons, aircraft) as **complimentary sinks** — not survival requirements.

**Candidate endgame milestone (not final):** CNA nuclear reactor online as a prestige power goal, with building and optimization continuing indefinitely after.

**Pace:** Progressive and satisfying — **not grindy**. Each new line should feel like a meaningful step up, not a hours-long slog. Exact hour targets are TBD; tune during playtest.

**Food** (Nourished + Delight ecosystem) supports long factory sessions with light buffs, not a competing progression tree.

---

## Locked design decisions

| Topic | Decision |
|-------|----------|
| **Audience** | Small server (2–5), cooperative factory/build focus |
| **Grind** | Avoid grind; 5× ore processing is the right ceiling |
| **Mining vs automation** | Manual mining should **not** beat automation for long — automate early, tune synthesis/deposits so bottlenecks shift to setup and throughput not strip-mining |
| **Combat weight** | **Low** — optional flavor, not a core pillar |
| **Infernal Mobs** | **Removing** — does not fit; needs a replacement plan (see below) |
| **PvP** | No design consideration |
| **Quest book** | **Optional guide** for non-technical players to learn processes; never required to progress; rewards complimentary, **not overpowering** |
| **Aeronautics** | **QoL transportation**; optional quest branch to teach basics for interested players |
| **Endgame** | TBD; leaning **CNA nuclear reactor** as a milestone in an **endless building** sandbox |

---

## Identity pillars

### 1. One canonical item per role

Duplicate metals and materials from addon mods are **unified**, not balanced against each other.

| Role | Canonical | Hidden / converted variants |
|------|-----------|----------------------------|
| Steel | `tfmg:steel_ingot` | CBC, CGS steel items |
| Lead | `tfmg:lead_ingot` | CGS lead |
| Sulfur | `tfmg:sulfur_dust` | CGS sulfur |
| Saltpeter | `tfmg:nitrate_dust` | CGS niter |
| Steel plate | `tfmg:heavy_plate` | CGS steel sheet |
| Flour / dough | `create:wheat_flour`, `create:dough` | FD / MoreDelight duplicates |

Implementation: `kubejs/server_scripts/unification.js`, `hide_duplicates.js`

**Rule:** New recipes use tags (`#c:ingots/steel`) or canonical IDs — never parallel `cgs:` / `createbigcannons:` ingots in pack scripts.

### 2. Tier parity across factory lines

Core metals are **2× / 3× / 5×**; other systems should have comparable depth — not one-step shortcuts.

| Tier | Ore (core metals) | Intended parallel |
|------|-------------------|-------------------|
| 2× | Smelt / blast crushed | Basic plates, early brass |
| 3× | Washing + byproducts | Copper wire, lead nuggets, sulfur RNG |
| 5× | Heated mixing + flux + fluid | Gold, lead/nickel endgame, electronics inputs |

**Rule:** Remove or rework mod recipes that bypass tier investment (e.g. CGS iron→steel mixing, direct lead smelting).

### 3. Byproduct loops tie lines together

Ore washing and secondary outputs feed downstream factories:

```
Iron wash  → redstone      → energiser billets (#4)
Zinc wash  → gunpowder     → early ammo (#11)
Lead wash  → sulfur_dust   → propellant, rubber (#3, #11)
Nickel wash→ sulfur_dust   → propellant
Gold 5×    → ingot flood   → energising, CBC plates
Lithium    → cooling fluid → petrochem + diamond billet (#4)
```

**Rule:** When adding a new processing line, ask what ore byproduct it consumes and what it produces for another line.

### 4. Create-automated discovery

Progression should be visible in **JEI/EMI** as chains of Create recipes (mixing, SA, mechanical crafting, pressing, blasting).

FTB Quests chapters (#7, #8, #10, #12) help **non-technical players** follow factory chains in-game — they do **not** gate recipes, power, or items.

### 5. TFMG-primary industry

**TFMG** owns heavy industry: steel, oil, plastics, cooling fluid, asphalt, distillation. CNA and CGS **plug into** TFMG outputs; they do not run parallel steel/oil/circuit economies.

| Domain | Primary mod | Pack role |
|--------|-------------|-----------|
| Ore → ingot tiers | Create + KubeJS | Foundation (#1) |
| Oil / plastics / coke | TFMG | Power & chemistry (#3) |
| Circuits / control | TFMG + custom items | Automation gates (#4) |
| FE / nuclear | Create New Age | Power bridge + endgame milestone |
| Firearms | CGS | Optional munitions sink (#11) |
| Artillery | CBC | Optional heavy sink (#5) |
| Transport | Create Aeronautics | QoL flight (#TBD quests) |

### 6. Automation beats mining quickly

- **Early:** Short manual mining / exploration window to bootstrap first machines.
- **Mid:** Ore Excavation + CoE deposits + 3×/5× lines should be the default metal source.
- **Building:** Stone synthesis (#9) should unlock **soon after** steel/flux — not as a late afterthought — so megabases never depend on continent strip-mining.

**Rule:** If players are still hand-mining bulk stone or ore past the mid-game milestone, the recipe timing is wrong.

### 7. Building is a first-class sink

Chipped, Rechiseled, Beautify, Supplementaries, Create Deco, asphalt — the pack exists for **large pretty factories**. Stone automation (#9) and architecture quests (#10) are core, not optional decoration.

---

## Progression model

```
Early          Mid                 Late mid              Endless
─────          ───                 ────────              ───────
Andesite       Steel + brass       Diesel + plastic      CNA nuclear (milestone?)
Crushing       Distillation        Cooling / lithium     Megabase optimization
2× metals      3× wash + drill     5× flux metals        Building variety (#9/#10)
Cobble/wood    TFMG circuits       Electronics SA        Optional CGS/CBC toys
               Stone automation    Control units         Aeronautics QoL
```

**Unlock order (epic #2):**

1. Ore processing (2×→5×) — **done** (#1)
2. Oil / petrochem — **done** (#3)
3. Electronics / CNA — **done** (#4)
4. Building stone automation — planned (#9) — prioritize **before** late combat toys
5. Gunsmithing integration — planned (#11) — **low priority**, optional sink
6. Explosives / CBC — planned (#5) — **low priority**, optional sink
7. Food / Nourished — planned (#6)

---

## Combat & munitions (low priority)

Combat is **not** a survival pillar. CGS and CBC exist because they fit the Create factory theme and consume metals/chemistry — not because players need guns to survive.

### Infernal Mobs — removed

Infernal Mobs is being removed from the pack. It conflicted with the cooperative, low-combat, factory-first tone.

**Replacement direction (TBD — track in GitHub issue):**

| Need | Proposal |
|------|----------|
| Why keep CGS/CBC at all? | Factory-themed **optional** production lines and build projects (ammo plants, cannon emplacements as set dressing) |
| Any threat? | Vanilla mob difficulty only; no elite random modifiers |
| Quest hooks | Teach ammo SA and cannon crafting as **factory challenges**, not kill quests |
| Balance | Do not gate factory progress on weapons; soften #11 weapon gates vs original combat-focused draft |

---

## Quest book philosophy

| Chapter | Issue | Audience | Role |
|---------|-------|----------|------|
| Ore processing | (TBD) | Everyone | Teach 2×/3×/5× |
| Petrochem / power | #7 | Non-technical | Oil → diesel → plastic |
| Electronics | #8 | Non-technical | CNA + control unit |
| Architecture | #10 | Builders | Stone + decoration |
| Combat / munitions | #12 | Optional | CGS + CBC as factory lines |
| Aeronautics | (TBD) | Optional | QoL flight tutorial |

**Principles:**

- Quests are **never required** — all progression available via JEI and experimentation.
- Written for players who do not want to read wikis or watch tutorials.
- Rewards: small material bundles, tools, cosmetics — **never** skip tiers or hand out endgame gear in bulk.
- Dependencies show **recommended order**, not hard locks.

---

## Technical implementation norms

| Practice | Standard |
|----------|----------|
| Scripts | One file per line (`petrochem.js`, `electronics.js`, …), priority field for load order |
| Recipe IDs | `kubejs:<line>/<type>/<name>` |
| Reload safety | Item registration in `startup_scripts/`; server recipe changes in `server_scripts/` |
| Fluids in Create | `Fluid.of('id', amount)` — not raw `fluid_stack` JSON |
| CNA energising | **Single item input** — use mixing billets first |
| TFMG vat | `{ tag: 'tfmg:flux' }` not `{ item: '#tfmg:flux' }`; no fluids in `tfmg:coking` |
| Verification | `/reload` + check `logs/kubejs/server.log` for failed recipes |

---

## Mod ecosystem roles (abbreviated)

| Category | Mods | Pack intent |
|----------|------|-------------|
| Core | Create, TFMG, KubeJS | Factory spine |
| Power | CNA, TFMG engines | FE + rotation; CNA nuclear = endgame milestone candidate |
| World | Terralith, Tectonic, Lithostitched | Exploration & aesthetics |
| Ores | CoE Deposits, Ore Excavation | Veins + drilling — automation path |
| Decoration | Chipped, Rechiseled, Beautify, … | Primary long-term sink |
| Munitions | CGS, CBC | Optional factory lines (low combat weight) |
| Food | FD, Central Kitchen, Nourished | Session buffs (#6) |
| QoL | JEI, Building Wands, FTB Chunks | Navigation & building |
| Transport | Create Aeronautics | QoL flight; optional teach quests |

**Removed / do not plan around:** Infernal Mobs

---

## Explicit non-goals

- **Tin** — not a processable ore; do not plan tin gates without adding ore gen.
- **Parallel cheap steel** from CGS or other mods.
- **Quest-gated progression** — no recipe locked behind quest completion.
- **Grind for grind's sake** — if a step feels like chores without factory payoff, redesign.
- **PvP balance**
- **Recipe-per-Chipped-variant** — automate base stones only (#9).
- **Combat-required progression** — guns/cannons never mandatory.

---

## Issue roadmap map

| # | Topic | Type | Priority |
|---|-------|------|----------|
| 1 | Ore processing | Implemented | Core |
| 2 | Epic — processing lines | Tracking | Core |
| 3 | Petrochem | Implemented | Core |
| 4 | Electronics | Implemented | Core |
| 5 | Explosives / CBC | Planned | Low |
| 6 | Food / Nourished | Planned | Medium |
| 7 | FTB Quests — petrochem | Quests | Medium |
| 8 | FTB Quests — electronics | Quests | Medium |
| 9 | Building stone automation | Planned | **High** |
| 10 | FTB Quests — architecture | Quests | Medium |
| 11 | CGS integration | Planned | Low |
| 12 | FTB Quests — combat | Quests | Low |
| 13 | Remove Infernal Mobs + combat redesign | Planned | Medium |

---

## Still open (minor)

- **Exact endgame milestone** — CNA reactor is the leading candidate; confirm after playtest.
- **Pace targets** — playtest-derived hour markers for diesel / stone automation / nuclear.
- **Aeronautics quest chapter** — create when flight basics are stable.
- **Infernal replacement** — finalize in #13 (likely: vanilla mobs + optional munitions as factory toys only).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-29 | Initial draft from implemented KubeJS lines and open GitHub issues |
| 2026-06-29 | Locked audience, pace, combat, quests, automation, and endgame direction per owner input; Infernal Mobs marked for removal |