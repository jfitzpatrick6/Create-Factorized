# Client setup — friends joining the pack

## One-time install

1. Install [Modrinth App](https://modrinth.com/app) and **Java 21** (Modrinth can install both).
2. Install **Git for Windows** ([git-scm.com](https://git-scm.com/download/win)).
3. Clone this repo **into** your Modrinth profile folder:

```powershell
cd $env:APPDATA\ModrinthApp\profiles
git clone https://github.com/jfitzpatrick6/neoforge-1.21.1-modpack.git "NeoForge 1.21.1"
```

4. In Modrinth App → **Add instance** → point at the cloned `NeoForge 1.21.1` folder (or refresh if it already appears).
5. Let Modrinth install **NeoForge 21.1.234** for Minecraft 1.21.1 on first launch.

**Private repo:** ask Jake for collaborator access, or use a read-only deploy token / SSH key before cloning.

---

## Updating when the pack changes

Modrinth App does **not** auto-run `git pull` when you click Play. Use one of these:

### Recommended — `Launch-Pack.bat`

Double-click **`Launch-Pack.bat`** in the profile root (pin it to taskbar or desktop).

It runs `git pull` then opens Modrinth App. Click **Play** as usual.

### Manual

```powershell
cd $env:APPDATA\ModrinthApp\profiles\"NeoForge 1.21.1"
git pull
```

Then launch from Modrinth App.

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