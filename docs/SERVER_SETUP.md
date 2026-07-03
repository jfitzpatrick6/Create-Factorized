# Dedicated server setup — NeoForge 1.21.1 Factory Pack

Guide for hosting the friend server (2–5 players). Client profile path in Modrinth App:

`%APPDATA%\ModrinthApp\profiles\NeoForge 1.21.1`

**Pinned versions:** Minecraft 1.21.1 · NeoForge **21.1.234** · Java **21**

---

## Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 6 GB (`-Xmx6G`) | 8 GB for Terralith + Create factories |
| CPU | 4 cores | 6+ cores (Create stress + chunk loading) |
| Disk | 10 GB free | SSD for world + logs |
| Java | **21** (64-bit) | Azul/Zulu/Temurin — **not** Java 8 on PATH |

Modrinth App ships Java 21 at:

`%APPDATA%\ModrinthApp\meta\java_versions\zulu21.44.17-ca-jre21.0.8-win_x64\bin\java.exe`

---

## Quick start (Windows)

### 1. Install NeoForge server (once)

From the profile root:

```powershell
cd server
java -jar neoforge-21.1.234-installer.jar --installServer
```

This creates `run.bat`, `libraries/`, and `user_jvm_args.txt`. Delete the installer jar afterward if you want.

### 2. Copy pack files

```powershell
powershell -File scripts\prepare_server_mods.ps1
```

Copies `mods/` (minus client-only jars), `config/`, `kubejs/`, `defaultconfigs/`, and `datapacks/` into `server/`.

**Client-only jars omitted on server** (see `scripts/prepare_server_mods.ps1`):

- Iris, Sodium, AppleSkin, Entity Culling, Controlling, Searchables
- JEI Worldgen, Create JEI Compat, Default Options, FerriteCore

**Kept on server:** JEI + fzzy_config (hard dependencies for JER/JEP/Immersive Paintings).

### 3. Accept EULA + properties

```powershell
cd server
echo eula=true > eula.txt
copy server.properties.example server.properties
```

Edit `server.properties`: `motd`, `max-players`, `server-port`, `online-mode`, etc.

### 4. Launch

```powershell
cd server
run.bat nogui
```

Or point Java 21 explicitly:

```powershell
& "$env:APPDATA\ModrinthApp\meta\java_versions\zulu21.44.17-ca-jre21.0.8-win_x64\bin\java.exe" @user_jvm_args.txt @libraries/net/neoforged/neoforge/21.1.234/win_args.txt nogui
```

First boot with ~108 mods can take **5–10 minutes** before `Done (X.XXXs)!` appears in `logs/latest.log`.

### 5. Smoke test (optional)

```powershell
powershell -File scripts\smoke_test_server.ps1 -WaitSeconds 600
```

Boots the server, waits for `Done`, then stops the process. Exit 0 = clean start.

---

## Pack policy (already configured)

| Setting | File | Value |
|---------|------|-------|
| Chunk unclaim idle | `config/ftbchunks-world.snbt` | 30 days |
| PvP in claims | `config/ftbchunks-world.snbt` | `never` |
| Infinite oil | `config/tfmg-common.toml` | `infiniteDeposits = true` |

Override per-world in `world/serverconfig/` after first launch if needed.

---

## Friends joining (client install)

### Option A — Modrinth App (recommended)

1. Export the profile from Modrinth App → **Export** → `.mrpack`.
2. Friends **Import** the `.mrpack` in Modrinth App.
3. Match NeoForge **21.1.234** when prompted.
4. Direct connect: `<your-ip>:25565` (port-forward UDP+TCP 25565 on the host router).

### Option B — Git clone

```powershell
git clone https://github.com/jfitzpatrick6/neoforge-1.21.1-modpack.git
```

Open the folder as a custom instance in Modrinth App and let it resolve NeoForge + Java 21.

### Default keybinds

`defaultoptions/options.txt` ships pack controls (JEI, Iris, FTB, backpacks, etc.).

**Default Options** mod (`defaultoptions-neoforge-1.21.1-21.1.7.jar` + `balm-neoforge`) applies these on **first client launch** only — existing `options.txt` is preserved.

---

## Linux / headless notes

- Use `server/run.sh nogui` after the same installer step.
- Set `JAVA_HOME` to Java 21.
- Run `prepare_server_mods.ps1` on Windows before rsync, or mirror its copy/skip logic in a shell script.
- systemd unit example: `ExecStart=/path/to/java @user_jvm_args.txt @libraries/.../unix_args.txt nogui`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Mod X requires jei` | Do **not** strip JEI from server — rerun `prepare_server_mods.ps1` |
| `requires fzzy_config` | Keep fzzy_config on server |
| Java 8 / wrong version | Use Java 21 path above |
| Slow first boot | Normal — wait for `Done` in log |
| KubeJS recipe parse warnings | Known noise from addon datapacks; pack scripts still load |
| Friends wrong keys | Install Default Options mod or merge `defaultoptions/options.txt` |

---

## What not to commit

The `server/` folder after install contains `libraries/`, `world/`, `logs/`, and `eula.txt`. These are gitignored. Tracked artifacts:

- `server/server.properties.example`
- `server/user_jvm_args.txt` (RAM defaults)
- `scripts/prepare_server_mods.ps1`
- `scripts/smoke_test_server.ps1`
- `docs/SERVER_SETUP.md`