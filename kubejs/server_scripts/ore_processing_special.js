// priority: 3
// Non-ingot materials: redstone, lapis, gems, and coal enrichment.

ServerEvents.recipes(event => {
  event.remove({ id: 'createoreexcavation:crushing/redstone_crushing' })

  event.recipes.create.crushing([
    Item.of('minecraft:redstone', 6),
    Item.of('create:experience_nugget').withChance(0.5)
  ], 'createoreexcavation:raw_redstone')
    .processingTime(250)
    .id('kubejs:ore_processing/redstone_crushing')

  event.recipes.create.splashing([
    Item.of('minecraft:redstone', 9),
    Item.of('minecraft:glowstone_dust').withChance(0.2)
  ], 'createoreexcavation:raw_redstone')
    .id('kubejs:ore_processing/redstone_washing')

  event.recipes.create.crushing([
    Item.of('minecraft:lapis_lazuli', 8),
    Item.of('create:experience_nugget').withChance(0.5)
  ], 'minecraft:lapis_ore')
    .processingTime(250)
    .id('kubejs:ore_processing/lapis_ore_crushing')

  event.recipes.create.crushing([
    Item.of('minecraft:lapis_lazuli', 10),
    Item.of('create:experience_nugget').withChance(0.5)
  ], 'minecraft:deepslate_lapis_ore')
    .processingTime(300)
    .id('kubejs:ore_processing/deepslate_lapis_crushing')

  event.recipes.create.splashing([
    Item.of('minecraft:lapis_lazuli', 12),
    Item.of('minecraft:prismarine_shard').withChance(0.15)
  ], 'minecraft:lapis_ore')
    .id('kubejs:ore_processing/lapis_washing')

  event.recipes.create.splashing([
    Item.of('minecraft:diamond', 1),
    Item.of('create:experience_nugget', 2).withChance(0.75)
  ], 'createoreexcavation:raw_diamond')
    .id('kubejs:ore_processing/raw_diamond_washing')

  event.recipes.create.splashing([
    Item.of('minecraft:emerald', 1),
    Item.of('create:experience_nugget', 2).withChance(0.75)
  ], 'createoreexcavation:raw_emerald')
    .id('kubejs:ore_processing/raw_emerald_washing')

  event.recipes.create.crushing([
    Item.of('minecraft:coal', 2),
    Item.of('create:experience_nugget').withChance(0.5)
  ], 'minecraft:coal')
    .processingTime(200)
    .id('kubejs:ore_processing/coal_crushing')
})