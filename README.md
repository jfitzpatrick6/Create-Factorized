# NeoForge 1.21.1 Modpack

Private modpack managed from Modrinth App.

## Tracked content

- `mods/` — installed mod jars
- `kubejs/` — recipe/tag unification scripts
- `config/` — mod configuration
- `defaultconfigs/`, `datapacks/`, `resourcepacks/`, `shaderpacks/`

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