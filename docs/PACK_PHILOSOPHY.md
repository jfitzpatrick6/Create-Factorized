# Pack Philosophy — NeoForge 1.21.1 Create Modpack

Living design document for planning recipes, quests, and balance. Update this when major decisions are made.

**Repo:** [jfitzpatrick6/neoforge-1.21.1-modpack](https://github.com/jfitzpatrick6/neoforge-1.21.1-modpack)  
**Planning epic:** GitHub #2

---

## Vision (draft)

A **Create-first industrial modpack** where the factory *is* the progression. Players scale from andesite machines to steel chemistry, oil refining, electronics, and automated production — while exploring Terralith/Tectonic terrain and expressing builds through a huge decorative block palette.

Combat (Infernal Mobs, CGS, CBC) exists as a **sink and reward** for factory output, not a separate survival game. Food (Nourished + Delight ecosystem) supports long factory sessions.

> **Open decision:** What is the intended “endgame win state”? (e.g. CNA reactor online, CBC siege battery, aesthetic megabase, quest book completion, or no formal end.)

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

If core metals are **2× / 3× / 5×**, other systems should have comparable depth — not one-step shortcuts.

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

Progression should be visible in **JEI/EMI** as chains of Create recipes (mixing, SA, mechanical crafting, pressing, blasting). Avoid opaque one-off crafts unless gated as intentional secrets.

FTB Quests chapters (#7, #8, #10, #12) exist to make chains **discoverable in-game** — not to gate power.

### 5. TFMG-primary industry

**The Factory Must Grow (TFMG)** owns heavy industry: steel, oil, plastics, cooling fluid, asphalt, distillation. CNA and CGS **plug into** TFMG outputs; they do not run parallel steel/oil/circuit economies.

| Domain | Primary mod | Pack role |
|--------|-------------|-----------|
| Ore → ingot tiers | Create + KubeJS | Foundation (#1) |
| Oil / plastics / coke | TFMG | Power & chemistry (#3) |
| Circuits / control | TFMG + custom items | Automation gates (#4) |
| FE / nuclear | Create New Age | Power bridge + endgame |
| Firearms | CGS | Personal combat sink (#11) |
| Artillery | CBC | Heavy munitions sink (#5) |

### 6. Exploration matters early; automation matters late

- **Worldgen:** Terralith + Tectonic + Lithostitched — variety, not instant renewable everything.
- **Deposits:** TFMG bedrock oil (scanner/pumpjack); CoE + Ore Excavation for ores (lead, etc.).
- **Late game:** KubeJS synthesis (#9) for building stones so megabases are not strip-mining the continent.

> **Open decision:** How punishing should finite worldgen be before synthesis unlocks? (hours of play / quest chapter / tech milestone)

### 7. Building is a first-class sink

Chipped, Rechiseled, Beautify, Supplementaries, Create Deco, asphalt — the pack encourages **large pretty factories**. Stone automation (#9) and architecture quests (#10) support this.

Combat bases and factory flooring should pull from the same material pipelines.

---

## Progression model (current plan)

```
Early          Mid                 Late mid              Late
─────          ───                 ────────              ────
Andesite       Steel + brass       Diesel + plastic      CNA nuclear
Crushing       Distillation        Cooling / lithium     Overcharged mats
2× metals      3× wash             5× flux metals        Control units
Cobble/wood    TFMG circuits       Electronics SA        CBC artillery
Flintlock?     Revolver SA ammo    Gatling / launcher    Megabase stone gen
```

**Unlock order (epic #2):**

1. Ore processing (2×→5×) — **done** (#1)
2. Oil / petrochem — **done** (#3)
3. Electronics / CNA — **done** (#4)
4. Building stone automation — planned (#9)
5. Gunsmithing integration — planned (#11)
6. Explosives / CBC — planned (#5)
7. Food / Nourished — planned (#6)

---

## Combat philosophy (draft)

- **Infernal Mobs** adds threat; firearms are **crafted answers** that require lead, sulfur, steel, and eventually oil/electronics.
- **CGS** = personal weapons, sequenced-assembly ammo factories.
- **CBC** = logistics-heavy artillery, shared propellant chemistry with CGS.
- Guns should not trivialize elites before **propellant + tier-2 weapons** (#11 gates).

> **Open decision:** Is combat a core pillar equal to factory building, or secondary spice for ~20% of players?

---

## Quest book philosophy (draft)

| Chapter | Issue | Role |
|---------|-------|------|
| Ore processing | (TBD / #1) | Teach 2×/3×/5× |
| Petrochem / power | #7 | Oil → diesel → plastic |
| Electronics | #8 | CNA + control unit |
| Architecture | #10 | Stone + decoration |
| Combat | #12 | CGS + CBC |

Quests **guide**; they do not replace JEI. Rewards stay modest — machines and knowledge are the real prize.

> **Open decision:** Should the quest book be required for key gates, or purely optional guidance?

---

## Technical implementation norms

| Practice | Standard |
|----------|----------|
| Scripts | One file per line (`petrochem.js`, `electronics.js`, …), priority field for load order |
| Recipe IDs | `kubejs:<line>/<type>/<name>` |
| Reload safety | Item registration in `startup_scripts/`; server recipe changes in `server_scripts/` |
| Fluids in Create | `Fluid.of('id', amount)` — not raw `fluid_stack` JSON (FD Extended lesson) |
| CNA energising | **Single item input** — use mixing billets first |
| TFMG vat | `{ tag: 'tfmg:flux' }` not `{ item: '#tfmg:flux' }`; no fluids in `tfmg:coking` |
| Verification | `/reload` + check `logs/kubejs/server.log` for failed recipes |

---

## Mod ecosystem roles (abbreviated)

| Category | Mods | Pack intent |
|----------|------|-------------|
| Core | Create, TFMG, KubeJS | Factory spine |
| Power | CNA, TFMG engines | FE + rotation bridges |
| World | Terralith, Tectonic, Lithostitched | Exploration & aesthetics |
| Ores | CoE Deposits, Ore Excavation | Veins + drilling |
| Decoration | Chipped, Rechiseled, Beautify, … | Build variety |
| Combat | CGS, CBC, Infernal Mobs | Sinks for metals/chemistry |
| Food | FD, Central Kitchen, Nourished | Session buffs (#6) |
| QoL | JEI, Building Wands, FTB Chunks | Navigation & building |
| Aviation | Create Aeronautics (bundled) | **TBD integration** |

> **Open decision:** What role should Create Aeronautics play? (endgame transport only / disabled gates / full quest branch)

---

## Explicit non-goals (current)

- **Tin** is not a processable ore in this pack — do not plan tin-dependent gates without adding ore gen.
- **No parallel cheap steel** from CGS or other mods.
- **No quest-required wiki** for core factory paths.
- **No recipe-per-Chipped-variant** — automate base stones only (#9).

---

## Issue roadmap map

| # | Topic | Type |
|---|-------|------|
| 1 | Ore processing | Implemented |
| 2 | Epic — processing lines | Tracking |
| 3 | Petrochem | Implemented |
| 4 | Electronics | Implemented |
| 5 | Explosives / CBC | Planned |
| 6 | Food / Nourished | Planned |
| 7 | FTB Quests — petrochem | Quests |
| 8 | FTB Quests — electronics | Quests |
| 9 | Building stone automation | Planned |
| 10 | FTB Quests — architecture | Quests |
| 11 | CGS integration | Planned |
| 12 | FTB Quests — combat | Quests |

---

## Open decisions (need owner input)

Please answer these so we can lock the philosophy doc and tune issues:

1. **Audience** — Solo expert builder, casual solo, or small friend server (2–5)?
2. **Pace** — Rough target for “first diesel generator” / “first revolver” (hours or in-game days)?
3. **Endgame** — What should feel like “done” for this pack?
4. **Combat weight** — Core loop vs optional (~10–30% of design effort)?
5. **Exploration** — How long should players rely on mining vs automation for stone/ores?
6. **Quest gating** — Optional guide vs hard gates on key items?
7. **Aeronautics** — Include in progression, QoL only, or defer?
8. **Difficulty** — Keep Infernal Mobs default, tune harder, or soften for factory focus?
9. **PvP** — Any design consideration for player combat?
10. **Grind tolerance** — Is 5× ore processing feel-good or should late lines use 3× equivalents?

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-29 | Initial draft from implemented KubeJS lines and open GitHub issues |