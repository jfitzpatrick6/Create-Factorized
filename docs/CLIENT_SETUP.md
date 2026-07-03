# Client setup — friends joining the pack

Pick **one launcher**. Prism is best if you want git pull every time you click Play.

---

## Option A — Prism Launcher (recommended)

[Prism Launcher](https://prismlauncher.org/) can run `git pull` **automatically** before Minecraft starts.

### One-time setup

1. Install **Prism Launcher**, **Git for Windows**, and ensure **Java 21** is available (Prism can download it).
2. Clone the pack anywhere you like, e.g.:

```powershell
git clone https://github.com/jfitzpatrick6/neoforge-1.21.1-modpack.git "$env:USERPROFILE\Games\NeoForge-1.21.1"
```

3. In Prism → **Add Instance** → **Import from zip/folder** → select the cloned folder.
4. Set the loader to **NeoForge 21.1.234** / Minecraft **1.21.1** if Prism asks (first launch may download missing libraries).
5. Open the instance → **Edit** → **Settings** → **Custom commands** tab.
6. **Pre-launch command:**

```
"%INST_DIR%\scripts\prism_prelaunch.cmd"
```

7. Save. Every **Launch** now runs `git pull` first; if the pack changed, restart is automatic on that same click.

**Private repo:** ask Jake for GitHub access before cloning.

### Why Prism over Modrinth App?

| | Prism | Modrinth App |
|---|-------|--------------|
| Pre-launch `git pull` | Built-in | Not supported |
| Instance folder = git repo | Yes | Awkward path under `%APPDATA%` |
| Modrinth/Curse mod installs | Yes | Yes |

---

## Option B — Modrinth App

1. Install [Modrinth App](https://modrinth.com/app) and **Java 21**.
2. Install **Git for Windows**.
3. Clone into the Modrinth profiles folder:

```powershell
cd $env:APPDATA\ModrinthApp\profiles
git clone https://github.com/jfitzpatrick6/neoforge-1.21.1-modpack.git "NeoForge 1.21.1"
```

4. Modrinth → add/refresh the instance → first launch installs NeoForge **21.1.234**.

### Updating (Modrinth)

Modrinth does **not** run `git pull` on Play. Use **`Launch-Pack.bat`** in the profile root (pull + opens Modrinth), or:

```powershell
cd $env:APPDATA\ModrinthApp\profiles\"NeoForge 1.21.1"
git pull
```

---

## What git updates (and what it does not)

| Updated by `git pull` | Not overwritten |
|----------------------|-----------------|
| `mods/`, `config/`, `kubejs/`, quests | `saves/` worlds |
| `defaultoptions/`, `shaderpacks/` | `options.txt` keybinds |
| Scripts and docs | `xaero/`, logs, caches |

If Jake adds a **new mod jar**, pull brings it in — no manual download.

If you edited local files git tracks (e.g. `config/sodium-options.json`), `git pull` may fail. Run `git stash`, pull, then `git stash pop` if you need to keep your tweaks.

---

## Connect to the server

Direct connect: `<host-ip>:25565` after Jake port-forwards or hosts.

Server and client must match the same pack commit (everyone runs `Launch-Pack.bat` before playing).