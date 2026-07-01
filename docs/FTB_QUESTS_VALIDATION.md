# FTB Quests — validation checklist

Run after editing quest SNBT, lang, or adding/removing mods.

## 1. Offline (repo root)

```powershell
python scripts/validate_quest_items.py
```

Expect: `OK — all non-vanilla quest item IDs resolve in mods/ or kubejs startup.`  
If items are missing, fix the SNBT task ID or add the item via KubeJS startup before shipping.

## 2. In-game reload

1. Launch NeoForge 1.21.1 client with this profile.
2. Open chat and run: `/ftbquests reload`
3. Confirm no errors in chat or `latest.log` mentioning `ftbquests` / `missing_item`.

## 3. Chapter smoke test (fresh or test world)

Open the quest book and verify each chapter loads without pink/black missing icons:

| Order | Chapter file | Welcome quest | Capstone |
|-------|--------------|---------------|----------|
| 0 | `factory_kitchen.snbt` | Welcome — Canteen | Canteen Capstone |
| 1 | `petrochem_factory.snbt` | Welcome — Petrochem Wing | Petrochem Capstone |
| 2 | `electronics_factory.snbt` | Welcome — Electronics Wing | Grid Online |
| 3 | `architecture_factory.snbt` | Welcome — Architecture Wing | Architecture Capstone |
| 4 | `munitions_factory.snbt` | Welcome — Security Wing | Munitions Capstone |
| 5 | `aeronautics_factory.snbt` | Welcome — Aeronautics Wing | Aeronautics Capstone |

### Quick spot checks

- [ ] Petrochem asphalt chain (5 steps) shows expanded copy with casting basin + hopper
- [ ] Electronics energising quests mention billet → energiser and FE costs
- [ ] Architecture Palette Master shows 10 item subtasks
- [ ] Munitions optional security wing does not block munitions branch
- [ ] Aeronautics levitite quest references end stone powder (not kerosene)

## 4. Pin HUD (optional UX)

On first playthrough, pin:

- **Petrochem** — `Welcome — Petrochem Wing`
- **Electronics** — `Welcome — Electronics Wing` and later `Grid Online`

Use **Pin Quest** on the quest screen (pinned panel appears per FTB Quests client settings).

## 5. Before release

- [ ] `validate_quest_items.py` exit code 0
- [ ] `/ftbquests reload` clean
- [ ] Commit includes both `config/ftbquests/` and `config/ftbquests/quests/lang/en_us.snbt` if copy changed
- [ ] New `kubejs` startup items: full client restart tested once