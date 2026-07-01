# FTB Quests refinement plan

Living follow-up to issues #7, #8, #10, #12, #14, and #6. First-pass chapters are **implemented**; this doc tracks how to make them cleaner, more verbose, and easier for non-technical players.

## Current state (2026-07-01)

| Chapter | File | Quests | Group | Status |
|---------|------|--------|-------|--------|
| Factory Canteen | `factory_kitchen.snbt` | 21 | Factory Support | ✓ #6 |
| Munitions | `munitions_factory.snbt` | 24 | Factory Support | ✓ #12 |
| Petrochem | `petrochem_factory.snbt` | 23 | Petrochemicals | ✓ #7 first pass |
| Electronics / CNA | `electronics_factory.snbt` | 28 | Electronics & Power | ✓ #8 first pass |
| Architecture | `architecture_factory.snbt` | 23 | Architecture & Stone | ✓ #10 first pass |
| Aeronautics | `aeronautics_factory.snbt` | 11 | Aeronautics (Optional) | ✓ #14 first pass |

Lang: `config/ftbquests/quests/lang/en_us.snbt` — all quest IDs have title, subtitle, and multi-line `quest_desc`.

---

## Design principles (refinement targets)

1. **Never gate recipes** — quests guide only; dependencies are pedagogical, not locks on JEI recipes.
2. **One machine per quest** — asphalt, energising, and stone synthesis stay split; never combine press + mixer + basin in one item task.
3. **Verbose, copy-paste hints** — each description names the block (`tfmg:casting_basin`), heat level, and common failure mode.
4. **Cross-links in text** — use chapter names, not raw hex IDs, in player-facing copy (fix any `8F01A…` leaks in desc).
5. **Modest rewards** — buckets, hoppers, XP nuggets, cosmetic blocks; never full machines or bypass materials.
6. **Spatial clarity** — left-to-right = time progression; capstones on the bottom row; optional branches above/below spine.

---

## Phase 1 — Structure & dependencies (high impact)

### 1.1 Munitions chapter cleanup
- [ ] Add explicit `dependencies` to security-wing quests (currently position-only).
- [ ] Fix overlapping nodes (`783AA06A` / `5A62058E` both at 4,4).
- [ ] Split CGS weapon branch onto a dedicated row below CBC shells.
- [ ] Add `dependency_requirement: "one_completed"` on tier-3 weapon forks (nailgun vs gatling).

### 1.2 Petrochem ↔ Architecture asphalt dedup
- [ ] Architecture quest `8F01C00000000023` (8× asphalt) should **depend on** petrochem `8F01A00000000024` OR use shared quest link.
- [ ] Add `quest_links` SNBT between chapters (FTB cross-chapter arrows) for asphalt and coke dust.

### 1.3 Electronics prerequisites
- [ ] Soft-link petrochem plastic/cooling quests via `quest_links` (not hard deps) into nuclear branch.
- [ ] Add optional side quest for `tfmg:firebrick_lined_vat` before heavy-oil coking mention.

### 1.4 Global chapter order
- [ ] Re-index `order_index`: Canteen (0) → Petrochem (1) → Electronics (2) → Architecture (3) → Munitions (4) → Aeronautics (5).
- [ ] Align with intended player journey: ore → oil → power → build → optional combat/flight.

---

## Phase 2 — Verbosity & beginner copy (medium impact)

### 2.1 Standard description template
Every `quest_desc` should follow this block order:

```
Purpose (1 line, colored)
Prerequisites / what you need nearby (bullets)
Machine steps (numbered, with heat/fluid)
Common mistakes (bullets)
JEI search hint (gray)
Optional cross-chapter pointer
```

### 2.2 High-friction recipes — expand in place

| Topic | Quests to expand | Add to text |
|-------|------------------|-------------|
| Asphalt casting | `8F01A` 20–24 | Basin vs Create basin, hopper under, 144 mB cast size |
| Energising | `8F01B` 19–1E | Billet mixing first, then energiser; FE costs |
| Reactor SA | `8F01B` 25–27 | Plastic + lithium steps; JEI IDs `kubejs:electronics/reactor_casing` |
| Rare stone | `8F01C` 18–1C | Flux source (#1 ore), superheated gate for deepslate |
| Chipped variants | `8F01C` 1E | Observation task + manual submit instead of 8 variant items |
| Aeronautics flight | `8F01D` 16–19 | Honor-system checkmarks → add `ftbquests:observation` if mod supports distance |

### 2.3 Task title pass
- [ ] Every `checkmark` task gets a plain-English `task.<id>.title` (petrochem/electronics/aero done; audit munitions).
- [ ] Item tasks: use `task.<id>.title` when count > 1 to explain *why* the count.

### 2.4 Remove internal IDs from player text
- [ ] Grep `en_us.snbt` for hex quest IDs in `quest_desc` and replace with chapter + quest title references.

---

## Phase 3 — Coverage gaps vs GitHub issues (fill in)

### Architecture (#10) — issue lists 7 groups; first pass covers spine only
- [ ] Add: sandstone/brick/terracotta shaped-stone quests (`8F01C` 27–29).
- [ ] Add: dripstone, mud, blackstone, ochrum/asurine/veridium individual quests.
- [ ] Add: “8 Chipped variants” observation quest.
- [ ] Add: Main Street place-32-blocks quest (use checkmark + screenshot honor or low-count place task).
- [ ] Add: Palette Master checklist (10 stone families).

### Petrochem (#7)
- [ ] Add: explicit “Flux Cracker” checkmark with vat size note.
- [ ] Add: second-pass heavy oil distillation quest.
- [ ] Add: propane/LPG mention in intro (optional sidebar text).

### Aeronautics (#14)
- [ ] Add: Rechiseled Aeronautics skin quest (compat mod).
- [ ] Audit `levitite_blend_bucket` vs kerosene — align task with actual mod fuel recipe after JEI test.

---

## Phase 4 — Visual & UX polish (low effort, high readability)

- [ ] Color-code quest shapes: `rsquare` intro, `diamond` milestones, `hexagon` capstones, `pentagon` optional.
- [ ] Use `size: 1.2d` on all capstones; `1.1d` on chapter intros.
- [ ] Set chapter `icon` to capstone output item where possible.
- [ ] Enable `default_hide_dependency_lines: true` on dense chapters after layout stabilizes.
- [ ] Pin “Grid Online” and “Welcome” quests via `data.snbt` defaults (if desired).

---

## Phase 5 — Tooling & maintenance

- [ ] Add `kubejs/README.md` note: quest SNBT lives in `config/ftbquests/`, not `kubejs/data/`.
- [ ] Script: validate all `item` task IDs against installed mods (jar item list).
- [ ] In-game checklist: `/ftbquests reload` + open each chapter on fresh profile.
- [ ] Close GitHub #7, #8, #10, #14 when Phase 1–2 complete; keep refinement as sub-issues.

---

## Suggested execution order

```
Week 1: Phase 1 (deps, layout, cross-links) + asphalt dedup
Week 2: Phase 2 (copy template pass on petrochem + electronics)
Week 3: Phase 3 architecture gap quests
Week 4: Phase 4–5 polish + in-game validation
```

## Success metrics

- New player can cast asphalt and reach reactor capstone **without wiki**, only quest book + JEI.
- Zero `ftbquests:missing_item` tasks in any chapter.
- No quest description references raw hex IDs.
- All six chapters pass `/ftbquests reload` on NeoForge 1.21.1 client.