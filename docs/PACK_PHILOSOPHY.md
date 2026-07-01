# Pack Philosophy — NeoForge 1.21.1 Create Modpack

Living design document for planning recipes, quests, and balance. Update this when major decisions are made.

**Repo:** [jfitzpatrick6/neoforge-1.21.1-modpack](https://github.com/jfitzpatrick6/neoforge-1.21.1-modpack)  
**Planning epic:** GitHub #2

---

## Vision

A **Create-first industrial modpack** for a **small friend server** (2–5 players) where the factory *is* the progression. Players scale from andesite machines through steel chemistry, oil refining, electronics, and full automation — while exploring Terralith/Tectonic terrain and building large, expressive bases over **endless play**.

**Official endgame milestone:** **CNA nuclear reactor online** — a prestige power goal marking the factory as “complete enough” to run indefinitely. Building, decoration, optimization, and optional toys continue forever after.

**Pace:** Progressive and satisfying — **not grindy**. Each new line should feel like a meaningful step up, not a hours-long slog. Exact hour targets are TBD; tune during playtest.

**Food** (Nourished + Delight ecosystem) supports long factory sessions with light buffs, not a competing progression tree.

---

## Locked design decisions

| Topic | Decision |
|-------|----------|
| **Audience** | Small server (2–5), cooperative factory/build focus |
| **Endgame milestone** | **CNA nuclear reactor** operational (quest capstone in #8) |
| **Post-endgame** | Endless building, decoration, logistics, optional projects |
| **Grind** | Avoid grind; 5× ore processing is the right ceiling |
| **Mining vs automation** | Manual mining should **not** beat automation for long |
| **Combat weight** | **Low** — see PvE model below |
| **Infernal Mobs** | **Removed** (jar already absent; config removed) |
| **PvP** | No design consideration |
| **Quest book** | **Optional guide** for non-technical players; never required; modest rewards |
| **Aeronautics** | **QoL transportation**; small optional quest chapter (#14) |

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

### 3. Byproduct loops tie lines together

```
Iron wash  → redstone      → energiser billets (#4)
Zinc wash  → gunpowder     → optional ammo (#11)
Lead wash  → sulfur_dust   → propellant, rubber (#3, #11)
Nickel wash→ sulfur_dust   → propellant
Gold 5×    → ingot flood   → energising, CBC plates
Lithium    → cooling fluid → petrochem + diamond billet (#4)
```

### 4. Create-automated discovery

Progression visible in **JEI/EMI**. FTB Quests (#6 canteen, #7, #8, #10, #12, #14) guide non-technical players — **never gate** recipes or power.

### 5. TFMG-primary industry

| Domain | Primary mod | Pack role |
|--------|-------------|-----------|
| Ore → ingot tiers | Create + KubeJS | Foundation (#1) |
| Oil / plastics / coke | TFMG | Power & chemistry (#3) |
| Circuits / control | TFMG + custom items | Automation gates (#4) |
| FE / **nuclear** | Create New Age | Power bridge + **endgame milestone** |
| Firearms | CGS | Optional munitions sink (#11) |
| Artillery | CBC | Optional heavy sink (#5) |
| Transport | Create Aeronautics | QoL flight (#14) |

### 6. Automation beats mining quickly

- **Early:** Short bootstrap mining window.
- **Mid:** Ore Excavation + CoE + 3×/5× = default metal source.
- **Building:** Stone synthesis (#9) unlocks soon after steel/flux — not late-game afterthought.

### 7. Building is a first-class sink

Chipped, Rechiseled, Beautify, Supplementaries, Create Deco, asphalt — the pack exists for **large pretty factories**.

---

## Progression model

```
Early          Mid                 Late mid              Endgame milestone
─────          ───                 ────────              ───────────────
Andesite       Steel + brass       Diesel + plastic      CNA reactor online
Crushing       Distillation        Cooling / lithium     (then: endless build)
2× metals      3× wash + drill     5× flux metals        Aeronautics QoL
Cobble/wood    TFMG circuits       Electronics SA        Optional munitions
               Stone automation    Control units         Megabase polish
```

**Core unlock order:** #1 → #3 → #4 → **nuclear (#8 capstone)** → #9 building stones → optional #11/#5 toys

---

## PvE model — “Industrial ecology” (replaces Infernal Mobs)

Combat is **low priority**. PvE should feel like **factory logistics and optional adventure**, not random elite mobs punishing builders.

### Layer 1 — Safe factory floor (default)

- **FTB Chunks** claiming: cooperative bases are build zones, not siege maps.
- Standard lighting + vanilla spawning rules outside claimed/work-lit areas.
- **Gravestone** mod: deaths are recoverable, low stress for casual co-op.

### Layer 2 — Mob infrastructure (factory “combat”)

The main PvE interaction is **automating mobs as resources**, not fighting them manually:

| System | Role |
|--------|------|
| Create mob farms | Deployer / fan / lava / crushing for drops |
| Create Enchantment Industry | XP fluid from farms → tools (factory enchant pipeline) |
| Farmer's Delight / Nourished | Mob drops → food buffs for long build sessions |
| Washing / processing | Loot tables as secondary inputs |

**Quest angle (#12 reframed):** “Security wing” — build a mob farm and CEI xp line, not kill elites.

### Layer 3 — Optional adventure (opt-in challenge)

| System | Role |
|--------|------|
| Terralith / Tectonic | Hazardous biomes as **co-op excursion** destinations for rare aesthetics or materials |
| Vanilla bosses | Dragon / Wither as **optional ceremonies**, never recipe gates |
| CGS / CBC | **Site clearance** when expanding into caves or new chunks — utility, not progression |
| Future evaluate | Lightweight **structure/loot** mods (not random elite modifiers) if more adventure wanted |

### What we explicitly reject

- Random elite modifiers on everyday mobs (Infernal Mobs pattern)
- Base raids or invasion timers disrupting builds
- Combat-required recipe gates
- PvP balancing

### Munitions (#11 / #12 / #5) in this model

Guns and cannons are **factory products and co-op toys**:

- Ammo plants as sequenced-assembly showcases
- Cannon emplacements as megabase decoration
- Clearance runs before new construction sites

**No main factory recipe should require killing anything.**

---

## Quest book philosophy

| Chapter | Issue | Role |
|---------|-------|------|
| Ore processing | (TBD) | 2×/3×/5× |
| Petrochem / power | #7 | Oil → diesel → plastic |
| Electronics / **nuclear** | #8 | CNA + **reactor capstone** |
| Architecture | #10 | Stone + decoration |
| Aeronautics | #14 | Optional flight QoL |
| Munitions factory | #12 | Optional CGS/CBC + mob farm |

**Principles:** optional, non-technical friendly, modest rewards, recommended order not hard locks.

---

## Technical implementation norms

| Practice | Standard |
|----------|----------|
| Scripts | One file per line; priority field for load order |
| Recipe IDs | `kubejs:<line>/<type>/<name>` |
| CNA energising | Single item input — mixing billets first |
| Verification | `/reload` + `logs/kubejs/server.log` |

---

## Mod ecosystem roles

| Category | Mods | Pack intent |
|----------|------|-------------|
| Core | Create, TFMG, KubeJS | Factory spine |
| Endgame power | CNA | **Nuclear reactor milestone** |
| World | Terralith, Tectonic, Lithostitched | Exploration & build palette |
| Ores | CoE Deposits, Ore Excavation | Automated mining |
| Decoration | Chipped, Rechiseled, Beautify, … | Primary endless sink |
| Munitions | CGS, CBC | Optional factory toys |
| PvE infra | CEI, Gravestone, FTB Chunks | Farms, recovery, safe bases |
| Transport | Create Aeronautics | QoL flight |
| Food | FD, Central Kitchen, Nourished | Session buffs (#6) |

**Removed:** Infernal Mobs

---

## Explicit non-goals

- Tin gates without ore gen
- Parallel cheap steel
- Quest-gated progression
- Grind without factory payoff
- PvP balance
- Combat-required progression
- Recipe-per-Chipped-variant

---

## Issue roadmap

| # | Topic | Priority |
|---|-------|----------|
| 2 | **Epic: processing line progression** | **Complete ✓** |
| 1 | Ore processing | Core ✓ |
| 3 | Petrochem | Core ✓ |
| 4 | Electronics | Core ✓ |
| 8 | FTB Quests — electronics + **nuclear capstone** | High ✓ |
| 9 | Building stone automation | High ✓ |
| 10 | FTB Quests — architecture | Medium ✓ |
| 14 | FTB Quests — aeronautics | Medium ✓ |
| 6 | Food / Nourished + **Factory Canteen** quests | Medium ✓ |
| 7 | FTB Quests — petrochem | Medium ✓ |
| 13 | Infernal removal + PvE model | Done (design) |
| 11 | CGS integration | Low ✓ |
| 12 | FTB Quests — munitions factory | Low ✓ |
| 5 | CBC explosives | Low ✓ |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-29 | Initial draft |
| 2026-06-29 | Locked audience, pace, combat, quests per owner input |
| 2026-06-29 | CNA reactor = official endgame; Industrial ecology PvE model; Infernal config removed; aero chapter #14 |
| 2026-07-01 | Issue #5 CBC explosives pipeline (`explosives.js`) |
| 2026-07-01 | Issue #12 Munitions Factory FTB Quests chapter |
| 2026-07-01 | Issue #11 CGS gunsmithing integration (`gunsmithing.js`) |
| 2026-07-01 | Issues #7/#8/#10/#14 FTB Quests chapters (first pass); `docs/QUEST_REFINEMENT_PLAN.md` |
| 2026-07-01 | Quest refinement Phase 1 — deps, cross-links, chapter order |
| 2026-07-01 | Epic #2 complete — all four processing lines + quest chapters; byproduct map in README |