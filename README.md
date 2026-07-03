# NeoForge 1.21.1 Modpack

Private modpack managed from Modrinth App.

## Tracked content

- `mods/` — installed mod jars
- `kubejs/` — recipe/tag unification scripts
- `config/` — mod configuration
- `defaultconfigs/`, `datapacks/`, `resourcepacks/`, `shaderpacks/`
- `docs/PACK_PHILOSOPHY.md` — design doc and issue roadmap ([epic #2](https://github.com/jfitzpatrick6/neoforge-1.21.1-modpack/issues/2))

## Factory processing lines (epic #2)

Unlock order and KubeJS scripts:

| Line | Script(s) | Quest chapter | Feeds |
|------|-----------|---------------|-------|
| Ore metallurgy | `ore_processing*.js` | `ore_processing_factory.snbt` | 2×/3×/5× metals, flux, byproducts |
| Storage / logistics | — | `storage_factory.snbt` | Sophisticated Storage, Tom's, Create buffers, backpacks |
| Petrochem / power | `petrochem.js` | `petrochem_factory.snbt` | Diesel, plastic, coke, asphalt |
| Electronics / CNA | `electronics.js` | `electronics_factory.snbt` | Coils, energising, **nuclear capstone** |
| Explosives / munitions | `explosives.js`, `gunsmithing.js` | `munitions_factory.snbt` | Sulfur/niter shells, CGS ammo |
| Food / nutrition | `food_compat.js` | `factory_kitchen.snbt` | Nourished factory meals |
| Building stones | `building_stones.js` | `architecture_factory.snbt` | Decoration sink (optional) |

**Cross-line byproduct loops** (ore washing → downstream):

```
Iron wash   → redstone        → CNA energiser billets
Zinc wash   → gunpowder       → munitions / CGS
Lead wash   → sulfur_dust     → propellant, rubber, petrochem
Nickel wash → sulfur_dust     → propellant
Gold 5×     → ingot flood     → energising, CBC plates
Lithium     → cooling fluid   → petrochem + diamond billet
Coke / heavy oil coking → coal_coke_dust → propellant binder
```

Quest book chapters are optional guides — they never gate recipes. See `docs/PACK_PHILOSOPHY.md` for balance principles.

## Friends — install & updates

See [`docs/CLIENT_SETUP.md`](docs/CLIENT_SETUP.md). **Prism Launcher** is recommended: set pre-launch to `scripts/prism_prelaunch.cmd` for automatic `git pull` on every Play. Modrinth App users can use **`Launch-Pack.bat`** instead.

## Dedicated server

See [`docs/SERVER_SETUP.md`](docs/SERVER_SETUP.md) for NeoForge 21.1.234 install, client-only mod filtering, smoke test, and friend onboarding.

## Shader packs

Bundled in `shaderpacks/`. Default selection in `config/iris.properties` is **Complementary Reimagined** (`K` toggles shaders, `O` opens the pack picker).

## Key bindings

Pack defaults live in `defaultoptions/options.txt` (conflict-free layout for JEI, Iris, FTB, Mechtrowel, Wands, and backpacks). Copy over your local `options.txt` key lines after a fresh install, or merge from that file if controls feel scrambled.

Highlights:

| Key | Action |
|-----|--------|
| `A` | Strafe left · JEI bookmark (different contexts) |
| `W` | Walk forward · Create Ponder (different contexts) |
| `R` | JEI show recipe · NTGL reload in gun menu (different contexts) |
| `U` | JEI — show uses |
| `K` | Iris — toggle shaders |
| `O` | Iris — shader pack menu |
| `M` | FTB Chunks — map |
| `;` | FTB Quests — quest book |
| `G` | Mechtrowel — open palette |
| `'` | Mechtrowel — toggle build mode |
| `.` | Mechtrowel — toggle replace |
| `B` | Sophisticated Backpacks — open backpack |

Some keys intentionally overlap vanilla movement or UI binds where the actions happen in different screens. Optional villager/vehicle keys stay unbound to avoid stealing factory hotkeys.

## Not tracked

World saves, logs, caches, and player-specific `options.txt` are excluded via `.gitignore`. Use `defaultoptions/options.txt` as the pack template.