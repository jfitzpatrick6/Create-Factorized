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
  event.remove({ id: 'createbigcannons:compacting/packed_gunpowder' })
  event.remove({ id: 'createbigcannons:mixing/congealed_nitro' })

  event.remove({ id: 'createbigcannons:ap_shell' })
  event.remove({ id: 'createbigcannons:he_shell' })
  event.remove({ id: 'createbigcannons:shrapnel_shell' })
  event.remove({ id: 'createbigcannons:solid_shot' })

  // --- Tier 1: primitive & bulk gunpowder -----------------------------------

  global.CreateRecipes.mixing(event, Item.of('minecraft:gunpowder', 4), [
    '2x tfmg:sulfur_dust',
    '2x tfmg:nitrate_dust',
    Fluid.of('minecraft:water', 250)
  ])
    .heated()
    .id('kubejs:explosives/mixing/gunpowder_from_chemistry')

  global.CreateRecipes.mixing(event, Item.of('minecraft:gunpowder', 2), [
    'minecraft:gunpowder',
    'minecraft:charcoal'
  ])
    .heated()
    .id('kubejs:explosives/mixing/gunpowder_zinc_supplement')

  // --- Tier 2: industrial propellant --------------------------------------

  global.CreateRecipes.mixing(event, Item.of('createbigcannons:packed_gunpowder', 2), [
    '2x tfmg:sulfur_dust',
    '2x tfmg:nitrate_dust',
    'tfmg:coal_coke',
    Fluid.of('minecraft:water', 250)
  ])
    .heated()
    .id('kubejs:explosives/mixing/packed_gunpowder')

  // --- Tier 4: hardened nitro (HE filler) ---------------------------------

  global.CreateRecipes.mixing(event, Item.of('createbigcannons:congealed_nitro', 2), [
    '2x tfmg:sulfur_dust',
    '2x tfmg:nitrate_dust',
    'tfmg:coal_coke',
    Fluid.of('tfmg:sulfuric_acid', 100)
  ])
    .heated()
    .processingTime(300)
    .id('kubejs:explosives/mixing/congealed_nitro')

  // --- Tier 3: shell fabrication (Create SA) --------------------------------
  // Deploy steps must use concrete items — KubeJS tag inputs serialize with
  // amount:1000 and Create treats them as fluid inputs in deployer recipes.

  global.CreateRecipes.sequenced_assembly(event, [
    Item.of('createbigcannons:solid_shot')
  ], 'minecraft:iron_ingot', [
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'tfmg:lead_nugget'
    ]),
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'tfmg:heavy_plate'
    ]),
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'minecraft:oak_slab'
    ]),
    global.CreateRecipes.pressing(event, 'minecraft:iron_ingot', 'minecraft:iron_ingot')
  ])
    .loops(1)
    .transitionalItem('minecraft:iron_ingot')
    .id('kubejs:explosives/sequenced_assembly/solid_shot')

  global.CreateRecipes.sequenced_assembly(event, [
    Item.of('createbigcannons:ap_shell')
  ], 'minecraft:iron_ingot', [
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'tfmg:cast_iron_ingot'
    ]),
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'createbigcannons:packed_guncotton'
    ]),
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'minecraft:oak_slab'
    ]),
    global.CreateRecipes.pressing(event, 'minecraft:iron_ingot', 'minecraft:iron_ingot')
  ])
    .loops(1)
    .transitionalItem('minecraft:iron_ingot')
    .id('kubejs:explosives/sequenced_assembly/ap_shell')

  global.CreateRecipes.sequenced_assembly(event, [
    Item.of('createbigcannons:he_shell')
  ], 'minecraft:iron_ingot', [
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'createbigcannons:packed_guncotton'
    ]),
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'minecraft:oak_slab'
    ]),
    global.CreateRecipes.pressing(event, 'minecraft:iron_ingot', 'minecraft:iron_ingot')
  ])
    .loops(1)
    .transitionalItem('minecraft:iron_ingot')
    .id('kubejs:explosives/sequenced_assembly/he_shell')

  global.CreateRecipes.sequenced_assembly(event, [
    Item.of('createbigcannons:shrapnel_shell')
  ], 'minecraft:iron_ingot', [
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'createbigcannons:shot_balls'
    ]),
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'createbigcannons:packed_gunpowder'
    ]),
    global.CreateRecipes.deploying(event, 'minecraft:iron_ingot', [
      'minecraft:iron_ingot',
      'minecraft:oak_slab'
    ]),
    global.CreateRecipes.pressing(event, 'minecraft:iron_ingot', 'minecraft:iron_ingot')
  ])
    .loops(1)
    .transitionalItem('minecraft:iron_ingot')
    .id('kubejs:explosives/sequenced_assembly/shrapnel_shell')

})