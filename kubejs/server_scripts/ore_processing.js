// priority: 1
// Tiered ore processing for core metals: 2x smelt, 3x wash, 5x heated mixing with flux.

function defineCoreMetal(event, config) {
  var name = config.name
  var crushed = config.crushed
  var ingot = config.ingot
  var nugget = config.nugget
  var washByproduct = config.washByproduct
  var washByproductChance = config.washByproductChance == null ? 0.75 : config.washByproductChance

  event.remove({ id: 'create:smelting/' + name + '_ingot_from_crushed' })
  event.remove({ id: 'create:blasting/' + name + '_ingot_from_crushed' })
  event.remove({ id: 'create:splashing/crushed_raw_' + name })

  event.remove({ id: 'minecraft:' + name + '_ingot_from_smelting_raw_' + name })
  event.remove({ id: 'minecraft:' + name + '_ingot_from_blasting_raw_' + name })
  event.remove({ type: 'minecraft:smelting', input: 'minecraft:raw_' + name, output: ingot })
  event.remove({ type: 'minecraft:blasting', input: 'minecraft:raw_' + name, output: ingot })

  event.smelting(Item.of(ingot, 2), crushed)
    .id('kubejs:ore_processing/' + name + '_2x_smelting')

  event.blasting(Item.of(ingot, 2), crushed)
    .cookingTime(100)
    .id('kubejs:ore_processing/' + name + '_2x_blasting')

  var splashOutputs = [Item.of(nugget, 27)]
  if (washByproduct) {
    splashOutputs.push(Item.of(washByproduct).withChance(washByproductChance))
  }

  event.recipes.create.splashing(splashOutputs, crushed)
    .id('kubejs:ore_processing/' + name + '_3x_splashing')

  var mixInputs = [crushed, '#tfmg:flux']
  if (washByproduct) {
    mixInputs.push(washByproduct)
  }

  event.recipes.create.mixing(Item.of(ingot, 5), mixInputs)
    .heated()
    .id('kubejs:ore_processing/' + name + '_5x_mixing')
}

ServerEvents.recipes(event => {
  defineCoreMetal(event, {
    name: 'iron',
    crushed: 'create:crushed_raw_iron',
    ingot: 'minecraft:iron_ingot',
    nugget: 'minecraft:iron_nugget',
    washByproduct: 'minecraft:redstone',
    washByproductChance: 0.75
  })

  defineCoreMetal(event, {
    name: 'copper',
    crushed: 'create:crushed_raw_copper',
    ingot: 'minecraft:copper_ingot',
    nugget: 'create:copper_nugget',
    washByproduct: 'minecraft:clay_ball',
    washByproductChance: 0.5
  })

  defineCoreMetal(event, {
    name: 'gold',
    crushed: 'create:crushed_raw_gold',
    ingot: 'minecraft:gold_ingot',
    nugget: 'minecraft:gold_nugget',
    washByproduct: 'minecraft:quartz',
    washByproductChance: 0.5
  })
})