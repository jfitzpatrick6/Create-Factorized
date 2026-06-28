// priority: 2
// Zinc, lead, nickel, and lithium processing lines.

function defineSimpleMetal(event, config) {
  var name = config.name
  var crushed = config.crushed
  var ingot = config.ingot
  var nugget = config.nugget
  var washByproduct = config.washByproduct
  var washByproductChance = config.washByproductChance == null ? 0.5 : config.washByproductChance
  var maxTier = config.maxTier == null ? 3 : config.maxTier

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

  if (maxTier >= 4 && config.mix4xInputs) {
    event.recipes.create.mixing(Item.of(ingot, 4), config.mix4xInputs)
      .heated()
      .id('kubejs:ore_processing/' + name + '_4x_mixing')
  }

  if (maxTier >= 5 && config.mix5xInputs) {
    event.recipes.create.mixing(Item.of(ingot, 5), config.mix5xInputs)
      .superheated()
      .id('kubejs:ore_processing/' + name + '_5x_mixing')
  }
}

ServerEvents.recipes(event => {
  event.remove({ id: 'create:smelting/zinc_ingot_from_crushed' })
  event.remove({ id: 'create:blasting/zinc_ingot_from_crushed' })
  event.remove({ id: 'create:splashing/crushed_raw_zinc' })
  event.remove({ id: 'create:smelting/zinc_ingot_from_raw_ore' })
  event.remove({ id: 'create:blasting/zinc_ingot_from_raw_ore' })

  defineSimpleMetal(event, {
    name: 'zinc',
    crushed: 'create:crushed_raw_zinc',
    ingot: 'create:zinc_ingot',
    nugget: 'create:zinc_nugget',
    washByproduct: 'minecraft:gunpowder',
    washByproductChance: 0.25,
    maxTier: 3
  })

  event.remove({ id: 'tfmg:smelting/lead_ingot_from_crushed_blasting' })
  event.remove({ id: 'tfmg:blasting/lead_ingot_from_crushed_blasting' })
  event.remove({ id: 'tfmg:smelting/lead_ingot' })
  event.remove({ id: 'tfmg:smelting/lead_ingot_blasting' })
  event.remove({ id: 'tfmg:blasting/lead_ingot_blasting' })
  event.remove({ id: 'tfmg:smelting/lead_ingot_from_crushed' })
  event.remove({ id: 'tfmg:blasting/lead_ingot_from_crushed' })

  defineSimpleMetal(event, {
    name: 'lead',
    crushed: 'create:crushed_raw_lead',
    ingot: 'tfmg:lead_ingot',
    nugget: 'tfmg:lead_nugget',
    washByproduct: 'tfmg:sulfur_dust',
    washByproductChance: 0.35,
    maxTier: 5,
    mix4xInputs: [
      'create:crushed_raw_lead',
      'tfmg:sulfur_dust',
      Fluid.of('minecraft:water', 250)
    ],
    mix5xInputs: [
      'create:crushed_raw_lead',
      '#tfmg:flux',
      'tfmg:sulfur_dust'
    ]
  })

  event.remove({ id: 'tfmg:smelting/nickel_ingot_from_crushed_blasting' })
  event.remove({ id: 'tfmg:blasting/nickel_ingot_from_crushed_blasting' })
  event.remove({ id: 'tfmg:smelting/nickel_ingot' })
  event.remove({ id: 'tfmg:smelting/nickel_ingot_blasting' })
  event.remove({ id: 'tfmg:blasting/nickel_ingot_blasting' })
  event.remove({ id: 'tfmg:smelting/nickel_ingot_from_crushed' })
  event.remove({ id: 'tfmg:blasting/nickel_ingot_from_crushed' })

  defineSimpleMetal(event, {
    name: 'nickel',
    crushed: 'create:crushed_raw_nickel',
    ingot: 'tfmg:nickel_ingot',
    nugget: 'tfmg:nickel_nugget',
    washByproduct: 'tfmg:sulfur_dust',
    washByproductChance: 0.25,
    maxTier: 5,
    mix4xInputs: [
      'create:crushed_raw_nickel',
      'tfmg:sulfur_dust',
      Fluid.of('minecraft:water', 250)
    ],
    mix5xInputs: [
      'create:crushed_raw_nickel',
      '#tfmg:flux',
      'tfmg:sulfur_dust'
    ]
  })

  event.remove({ id: 'tfmg:smelting/lithium_ingot_from_crushed_blasting' })
  event.remove({ id: 'tfmg:blasting/lithium_ingot_from_crushed_blasting' })
  event.remove({ id: 'tfmg:smelting/lithium_ingot' })
  event.remove({ id: 'tfmg:smelting/lithium_ingot_blasting' })
  event.remove({ id: 'tfmg:blasting/lithium_ingot_blasting' })

  event.smelting(Item.of('tfmg:lithium_ingot', 2), 'tfmg:crushed_raw_lithium')
    .id('kubejs:ore_processing/lithium_2x_smelting')

  event.blasting(Item.of('tfmg:lithium_ingot', 2), 'tfmg:crushed_raw_lithium')
    .cookingTime(100)
    .id('kubejs:ore_processing/lithium_2x_blasting')

  event.recipes.create.splashing([
    Item.of('tfmg:lithium_nugget', 27),
    Item.of('minecraft:water_bucket').withChance(0.15)
  ], 'tfmg:crushed_raw_lithium')
    .id('kubejs:ore_processing/lithium_3x_splashing')

  event.recipes.create.mixing(Item.of('tfmg:lithium_ingot', 2), [
    'tfmg:crushed_raw_lithium',
    'tfmg:cooling_fluid_bottle'
  ]).id('kubejs:ore_processing/lithium_cooled_mixing')

  event.custom({
    type: 'tfmg:vat_machine_recipe',
    allowed_vat_types: ['tfmg:steel_vat', 'tfmg:firebrick_lined_vat'],
    heat_requirement: 'heated',
    ingredients: [
      { item: 'tfmg:crushed_raw_lithium' },
      { item: 'tfmg:crushed_raw_lithium' },
      { item: 'tfmg:cooling_fluid_bottle' }
    ],
    machines: ['tfmg:electrode', 'tfmg:electrode'],
    min_size: 1,
    processing_time: 120,
    results: [
      { id: 'tfmg:lithium_ingot', count: 3 }
    ]
  }).id('kubejs:ore_processing/lithium_vat_electrolysis')

  event.remove({ type: 'minecraft:smelting', input: 'tfmg:raw_lead', output: 'tfmg:lead_ingot' })
  event.remove({ type: 'minecraft:blasting', input: 'tfmg:raw_lead', output: 'tfmg:lead_ingot' })
  event.remove({ type: 'minecraft:smelting', input: 'tfmg:raw_nickel', output: 'tfmg:nickel_ingot' })
  event.remove({ type: 'minecraft:blasting', input: 'tfmg:raw_nickel', output: 'tfmg:nickel_ingot' })
  event.remove({ type: 'minecraft:smelting', input: 'tfmg:raw_lithium', output: 'tfmg:lithium_ingot' })
  event.remove({ type: 'minecraft:blasting', input: 'tfmg:raw_lithium', output: 'tfmg:lithium_ingot' })
})
