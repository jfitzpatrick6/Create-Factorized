# FTB Quests — validation checklist

Run after editing quest SNBT, lang, or adding/removing mods.

**Do not use the in-game FTB Quests editor** on this pack. Saving from the editor rewrites
`config/ftbquests/quests/chapters/*.snbt` with new random quest IDs and empty item tasks.
Titles and descriptions live in `lang/en_us.snbt` keyed by those IDs — the book will show
**Unknown**, blank descriptions, and question-mark icons until you restore from git:

```powershell
git checkout HEAD -- config/ftbquests/
```

Then fully restart Minecraft (not just `/reload`) so the client does not re-save corrupted files on exit.

## 1. Offline (repo root)

```powershell
python scripts/validate_quest_items.py
```

Expect:
- `OK — all non-vanilla quest item IDs resolve in mods/ or kubejs startup.`
- `OK — N quests have matching en_us lang entries; no editor corruption signals.`

If items are missing, fix the SNBT task ID or add the item via KubeJS startup before shipping.
If corruption is reported, restore `config/ftbquests/` from git before editing quests in the repo.

## 2. In-game reload

1. Launch NeoForge 1.21.1 client with this profile.
2. Open chat and run: `/ftbquests reload`
3. Confirm no errors in chat or `latest.log` mentioning `ftbquests` / `missing_item`.

## 3. Chapter smoke test (fresh or test world)

Open the quest book and verify each chapter loads without pink/black missing icons:

| Order | Chapter file | Welcome quest | Capstone |
|-------|--------------|---------------|----------|
| -1 | `ore_processing_factory.snbt` | Welcome — Ore Wing | Ore Wing Capstone |
| 0 | `storage_factory.snbt` | Welcome — Storage Wing | Storage Wing Capstone |
| 1 | `factory_kitchen.snbt` | Welcome — Canteen | Canteen Capstone |
| 2 | `petrochem_factory.snbt` | Welcome — Petrochem Wing | Petrochem Capstone |
| 3 | `electronics_factory.snbt` | Welcome — Electronics Wing | Grid Online |
| 4 | `architecture_factory.snbt` | Welcome — Architecture Wing | Architecture Capstone |
| 5 | `munitions_factory.snbt` | Welcome — Security Wing | Munitions Capstone |
| 6 | `aeronautics_factory.snbt` | Welcome — Aeronautics Wing | Aeronautics Capstone |

### Quick spot checks

- [ ] Ore chapter welcome explains 2×/3×/5× tiers, flux, and byproduct loops
- [ ] Storage chapter covers Sophisticated compacting, Tom's terminal, and Create vault buffers
- [ ] Ore capstone opens after 5× iron plus any one advanced branch (lead, nickel, drilling, or specialty ores)
- [ ] Petrochem asphalt chain (5 steps) shows expanded copy with casting basin + hopper
- [ ] Electronics energising quests mention billet → energiser and FE costs
- [ ] Architecture Palette Master shows 10 item subtasks
- [ ] Munitions optional security wing does not block munitions branch
- [ ] Aeronautics levitite quest references end stone powder (not kerosene)

## 4. Pin HUD (optional UX)

On first playthrough, pin:

- **Ore** — `Welcome — Ore Wing`
- **Storage** — `Welcome — Storage Wing`
- **Petrochem** — `Welcome — Petrochem Wing`
- **Electronics** — `Welcome — Electronics Wing` and later `Grid Online`

Use **Pin Quest** on the quest screen (pinned panel appears per FTB Quests client settings).

## 5. Before release

- [ ] `validate_quest_items.py` exit code 0
- [ ] `/ftbquests reload` clean
- [ ] Commit includes both `config/ftbquests/` and `config/ftbquests/quests/lang/en_us.snbt` if copy changed
- [ ] New `kubejs` startup items: full client restart tested once