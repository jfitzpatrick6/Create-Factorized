// priority: 5
// Explosives & munitions pipeline — issue #5
//
// Tiers:
//   1 — sulfur/nitrate + water → gunpowder (ore-wash byproducts required)
//   2 — coke-age heated mixing → packed_gunpowder (cannon propellant)
//   3 — sequenced assembly → solid shot / AP / HE / shrapnel shells
//   4 — sulfuric acid mixing → congealed_nitro → hardened_nitro (HE filler)
//
// Cannons and guns are optional factory sinks — never progression gates.

ServerEvents.tags('item', event => {
  event.add('createbigcannons:high_explosive_materials', [
    'createbigcannons:hardened_nitro',
    'createbigcannons:nitropowder'
  ])
})

ServerEvents.recipes(event => {
  // --- Remove sulfur/niter bypass routes ------------------------------------

  event.remove({ id: 'minecraft:gunpowder' })
  event.remove({ id: 'cgs:mixing/niter_guano' })
  event.remove({ id: 'cgs:mixing/niter_rot' })
  event.remove({ id: 'cgs:mixing/steel_ingot' })

  event.remove({ id: 'createbigcannons:compacting/packed_gunpowder' })
  event.remove({ id: 'createbigcannons:mixing/congealed_nitro' })

  event.remove({ id: 'createbigcannons:ap_shell' })
  event.remove({ id: 'createbigcannons:he_shell' })
  event.remove({ id: 'createbigcannons:shrapnel_shell' })
  event.remove({ id: 'createbigcannons:solid_shot' })

  // --- Tier 1: primitive & bulk gunpowder -----------------------------------

  event.recipes.create.mixing(Item.of('minecraft:gunpowder', 4), [
    '2x tfmg:sulfur_dust',
    '2x tfmg:nitrate_dust',
    Fluid.of('minecraft:water', 250)
  ])
    .heated()
    .id('kubejs:explosives/mixing/gunpowder_from_chemistry')

  event.recipes.create.mixing(Item.of('minecraft:gunpowder', 2), [
    'minecraft:gunpowder',
    'minecraft:charcoal'
  ])
    .heated()
    .id('kubejs:explosives/mixing/gunpowder_zinc_supplement')

  // --- Tier 2: industrial propellant --------------------------------------

  event.recipes.create.mixing(Item.of('createbigcannons:packed_gunpowder', 2), [
    '2x tfmg:sulfur_dust',
    '2x tfmg:nitrate_dust',
    'tfmg:coal_coke',
    Fluid.of('minecraft:water', 250)
  ])
    .heated()
    .id('kubejs:explosives/mixing/packed_gunpowder')

  // --- Tier 4: hardened nitro (HE filler) ---------------------------------

  event.recipes.create.mixing(Item.of('createbigcannons:congealed_nitro', 2), [
    '2x tfmg:sulfur_dust',
    '2x tfmg:nitrate_dust',
    'tfmg:coal_coke',
    Fluid.of('tfmg:sulfuric_acid', 100)
  ])
    .heated()
    .processingTime(300)
    .id('kubejs:explosives/mixing/congealed_nitro')

  // --- Tier 3: shell fabrication (Create SA) --------------------------------

  event.recipes.create.sequenced_assembly([
    Item.of('createbigcannons:solid_shot')
  ], '#c:ingots/iron', [
    event.recipes.create.deploying('minecraft:iron_ingot', [
      '#c:ingots/iron',
      '4x tfmg:lead_nugget'
    ]),
    event.recipes.create.deploying('minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'tfmg:heavy_plate'
    ]),
    event.recipes.create.deploying('minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      '#minecraft:wooden_slabs'
    ]),
    event.recipes.create.pressing('minecraft:iron_ingot', 'minecraft:iron_ingot')
  ])
    .loops(1)
    .transitionalItem('minecraft:iron_ingot')
    .id('kubejs:explosives/sequenced_assembly/solid_shot')

  event.recipes.create.sequenced_assembly([
    Item.of('createbigcannons:ap_shell')
  ], '#c:ingots/iron', [
    event.recipes.create.deploying('minecraft:iron_ingot', [
      '#c:ingots/iron',
      '#c:ingots/cast_iron'
    ]),
    event.recipes.create.deploying('minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'createbigcannons:packed_guncotton'
    ]),
    event.recipes.create.deploying('minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      '#minecraft:wooden_slabs'
    ]),
    event.recipes.create.pressing('minecraft:iron_ingot', 'minecraft:iron_ingot')
  ])
    .loops(1)
    .transitionalItem('minecraft:iron_ingot')
    .id('kubejs:explosives/sequenced_assembly/ap_shell')

  event.recipes.create.sequenced_assembly([
    Item.of('createbigcannons:he_shell')
  ], '#c:ingots/iron', [
    event.recipes.create.deploying('minecraft:iron_ingot', [
      '#c:ingots/iron',
      'createbigcannons:packed_guncotton'
    ]),
    event.recipes.create.deploying('minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      '#minecraft:wooden_slabs'
    ]),
    event.recipes.create.pressing('minecraft:iron_ingot', 'minecraft:iron_ingot')
  ])
    .loops(1)
    .transitionalItem('minecraft:iron_ingot')
    .id('kubejs:explosives/sequenced_assembly/he_shell')

  event.recipes.create.sequenced_assembly([
    Item.of('createbigcannons:shrapnel_shell')
  ], '#c:ingots/iron', [
    event.recipes.create.deploying('minecraft:iron_ingot', [
      '#c:ingots/iron',
      'createbigcannons:shot_balls'
    ]),
    event.recipes.create.deploying('minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'createbigcannons:packed_gunpowder'
    ]),
    event.recipes.create.deploying('minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      '#minecraft:wooden_slabs'
    ]),
    event.recipes.create.pressing('minecraft:iron_ingot', 'minecraft:iron_ingot')
  ])
    .loops(1)
    .transitionalItem('minecraft:iron_ingot')
    .id('kubejs:explosives/sequenced_assembly/shrapnel_shell')

  // --- CGS ammo: bulk propellant batch --------------------------------------

  event.recipes.create.mixing(Item.of('minecraft:gunpowder', 6), [
    '3x tfmg:sulfur_dust',
    '3x tfmg:nitrate_dust',
    'tfmg:coal_coke_dust',
    Fluid.of('minecraft:water', 500)
  ])
    .heated()
    .processingTime(400)
    .id('kubejs:explosives/mixing/cgs_propellant_batch')
})