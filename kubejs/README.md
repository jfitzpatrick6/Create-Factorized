# KubeJS — NeoForge 1.21.1 modpack

Recipe gates, custom items, and pack tweaks live here. **FTB Quests do not.**

## Where things live

| Content | Path |
|---------|------|
| KubeJS scripts | `kubejs/server_scripts/`, `startup_scripts/`, `client_scripts/` |
| Datapack JSON (CoE, tags, recipes) | `kubejs/data/` |
| **FTB Quests chapters** | `config/ftbquests/quests/chapters/*.snbt` |
| Quest lang / copy | `config/ftbquests/quests/lang/en_us.snbt` |
| Quest book defaults | `config/ftbquests/quests/data.snbt` |
| Refinement roadmap | `docs/QUEST_REFINEMENT_PLAN.md` |

Do not put quest SNBT under `kubejs/data/` — FTB Quests only reads `config/ftbquests/`.

## Processing lines (epic #2)

| Script | Issue | Role |
|--------|-------|------|
| `ore_processing.js` + `*_modded.js` + `*_special.js` + `*_cleanup.js` | #1 | 2×/3×/5× crush/wash/mix; byproducts |
| `unification.js` | — | Canonical metals, food, tags |
| `petrochem.js` | #3 | Distillation tweaks, coke, asphalt casting |
| `electronics.js` | #4 | CNA coils, energiser billets, reactor SA |
| `explosives.js` | #5 | Gunpowder, packed powder, CBC shell SA |
| `gunsmithing.js` | #11 | CGS steel bypass removal, propellant, weapon gates |
| `food_compat.js` | #6 | FD Extended fixes, factory meals, lunchbox |
| `building_stones.js` | #9 | Heated/superheated stone synthesis |

Reload check: `logs/kubejs/server.log` should report **0 errors** after `/reload`.

## Layout

- `server_scripts/` — recipes, removals, sequenced assembly (petrochem, electronics, building stones, munitions, food)
- `startup_scripts/` — custom items (`kubejs:*`) registered before recipes load
- `client_scripts/` — JEI hiding, client-only tweaks
- `data/` — NeoForge datapack entries (deposits, biome modifiers, casting JSON)

## Maintenance

**Validate quest item IDs** (tasks, rewards, chapter icons) against installed mods:

```powershell
python scripts/validate_quest_items.py
```

**In-game reload** after editing quests:

```
/ftbquests reload
```

See `docs/FTB_QUESTS_VALIDATION.md` for the full chapter smoke-test checklist.

## Custom kubejs items (startup)

| Item | Script |
|------|--------|
| `factory_propellant` | `startup_scripts/gunsmithing_items.js` |
| Food / lunchbox line | `startup_scripts/food_items.js` |
| Electronics billets / control unit | `startup_scripts/electronics_items.js` |

Restart the game once after adding a new startup item — clients need the registry sync.