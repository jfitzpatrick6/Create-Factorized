// Prevent in-game FTB Quests editor saves from randomizing chapter/quest IDs on the server.
// Pack quests are authored in git under config/ftbquests/ — never edit them in-game.

ServerEvents.loaded((event) => {
  event.server.runCommandSilent('ftbquests editing_mode false @a')
})

PlayerEvents.loggedIn((event) => {
  event.server.runCommandSilent(`ftbquests editing_mode false ${event.player.username}`)
})