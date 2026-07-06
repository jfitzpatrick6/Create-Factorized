// priority: 3
// Non-ingot materials: redstone, lapis, gems, and coal enrichment.

ServerEvents.recipes(event => {
  event.remove({ id: 'createoreexcavation:crushing/redstone_crushing' })

  global.CreateRecipes.crushing(event, [
    Item.of('minecraft:redstone', 6),
    global.CreateItem.of('create:experience_nugget', 0.5)
  ], 'createoreexcavation:raw_redstone')
    .processingTime(250)
    .id('kubejs:ore_processing/redstone_crushing')

  global.CreateRecipes.splashing(event, [
    Item.of('minecraft:redstone', 9),
    global.CreateItem.of('minecraft:glowstone_dust', 0.2)
  ], 'createoreexcavation:raw_redstone')
    .id('kubejs:ore_processing/redstone_washing')

  global.CreateRecipes.crushing(event, [
    Item.of('minecraft:lapis_lazuli', 8),
    global.CreateItem.of('create:experience_nugget', 0.5)
  ], 'minecraft:lapis_ore')
    .processingTime(250)
    .id('kubejs:ore_processing/lapis_ore_crushing')

  global.CreateRecipes.crushing(event, [
    Item.of('minecraft:lapis_lazuli', 10),
    global.CreateItem.of('create:experience_nugget', 0.5)
  ], 'minecraft:deepslate_lapis_ore')
    .processingTime(300)
    .id('kubejs:ore_processing/deepslate_lapis_crushing')

  global.CreateRecipes.splashing(event, [
    Item.of('minecraft:lapis_lazuli', 12),
    global.CreateItem.of('minecraft:prismarine_shard', 0.15)
  ], 'minecraft:lapis_ore')
    .id('kubejs:ore_processing/lapis_washing')

  global.CreateRecipes.splashing(event, [
    Item.of('minecraft:diamond', 1),
    global.CreateItem.of('2x create:experience_nugget', 0.75)
  ], 'createoreexcavation:raw_diamond')
    .id('kubejs:ore_processing/raw_diamond_washing')

  global.CreateRecipes.splashing(event, [
    Item.of('minecraft:emerald', 1),
    global.CreateItem.of('2x create:experience_nugget', 0.75)
  ], 'createoreexcavation:raw_emerald')
    .id('kubejs:ore_processing/raw_emerald_washing')

  global.CreateRecipes.crushing(event, [
    Item.of('minecraft:coal', 2),
    global.CreateItem.of('create:experience_nugget', 0.5)
  ], 'minecraft:coal')
    .processingTime(200)
    .id('kubejs:ore_processing/coal_crushing')
})