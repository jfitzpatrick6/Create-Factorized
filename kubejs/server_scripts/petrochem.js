// priority: 3
// Petrochemical progression — issue #3
//
// Baselines (TFMG 1.2.0 defaults):
//   crude_oil 340 mB  -> 120 heavy + 60 diesel + 30 kerosene + 10 naphtha + 60 gasoline + 60 lpg
//   heavy_oil 200 mB  -> 100 heavy + 25 lube + 50 diesel + 20 kerosene + 5 naphtha
//   naphtha 500 mB    -> 250 ethylene + 250 propylene (vat, heated)
//   heavy_oil 1000 mB -> 1 bitumen (Create compacting, heated)
//   asphalt_mixture + 250 mB water -> 1000 mB liquid_asphalt (Create mixing)
//
// Pack tweaks:
//   crude_oil distillation — diesel-biased split (+10 diesel, -10 gasoline, -10 lpg)
//   heavy_oil 500 mB (vat, superheated) -> 1 coal_coke + 50 creosote + 40 CO2
//   liquid_asphalt 144 mB (casting / compacting) -> 1 asphalt block (basin tank max = 144 mB)
//   liquid_asphalt mixing requires heat

ServerEvents.tags('fluid', event => {
  event.add('tfmg:firebox_fuel', [
    'tfmg:gasoline',
    'tfmg:flowing_gasoline'
  ])
})

ServerEvents.recipes(event => {
  // --- Distillation ---------------------------------------------------------

  event.remove({ id: 'tfmg:distillation/crude_oil' })
  event.custom({
    type: 'tfmg:distillation',
    ingredients: [
      { type: 'neoforge:single', amount: 340, fluid: 'tfmg:crude_oil' }
    ],
    results: [
      { amount: 120, id: 'tfmg:heavy_oil' },
      { amount: 70, id: 'tfmg:diesel' },
      { amount: 30, id: 'tfmg:kerosene' },
      { amount: 10, id: 'tfmg:naphtha' },
      { amount: 50, id: 'tfmg:gasoline' },
      { amount: 50, id: 'tfmg:lpg' }
    ]
  }).id('kubejs:petrochem/distillation/crude_oil')

  // --- Machine gating -------------------------------------------------------

  event.replaceInput(
    { id: 'tfmg:crafting/materials/steel_distillation_controller' },
    '#c:plates/lead',
    '#c:plates/steel'
  )

  // --- Advanced petrochemicals ----------------------------------------------

  event.custom({
    type: 'tfmg:vat_machine_recipe',
    allowed_vat_types: ['tfmg:steel_vat', 'tfmg:firebrick_lined_vat'],
    heat_requirement: 'superheated',
    ingredients: [
      { type: 'neoforge:single', amount: 500, fluid: 'tfmg:naphtha' },
      { tag: 'tfmg:flux' },
      { type: 'neoforge:single', amount: 250, fluid: 'minecraft:water' }
    ],
    machines: ['tfmg:mixing'],
    min_size: 2,
    processing_time: 200,
    results: [
      { amount: 200, id: 'tfmg:ethylene' },
      { amount: 150, id: 'tfmg:propylene' },
      { amount: 100, id: 'tfmg:gasoline' }
    ]
  }).id('kubejs:petrochem/catalytic_cracking')

  event.custom({
    type: 'tfmg:vat_machine_recipe',
    allowed_vat_types: ['tfmg:steel_vat', 'tfmg:firebrick_lined_vat'],
    heat_requirement: 'superheated',
    ingredients: [
      { type: 'neoforge:single', amount: 500, fluid: 'tfmg:gasoline' },
      { type: 'neoforge:single', amount: 250, fluid: 'tfmg:sulfuric_acid' },
      { item: 'tfmg:aluminum_ingot' }
    ],
    machines: ['tfmg:mixing'],
    min_size: 2,
    processing_time: 300,
    results: [
      { amount: 750, id: 'tfmg:kerosene' }
    ]
  }).id('kubejs:petrochem/premium_fuel_reforming')

  event.custom({
    type: 'tfmg:vat_machine_recipe',
    allowed_vat_types: ['tfmg:steel_vat', 'tfmg:firebrick_lined_vat'],
    heat_requirement: 'superheated',
    ingredients: [
      { type: 'neoforge:single', amount: 500, fluid: 'tfmg:heavy_oil' }
    ],
    machines: ['tfmg:mixing'],
    min_size: 2,
    processing_time: 1800,
    results: [
      { id: 'tfmg:coal_coke' },
      { amount: 50, id: 'tfmg:creosote' },
      { amount: 40, id: 'tfmg:carbon_dioxide' }
    ]
  }).id('kubejs:petrochem/heavy_oil_coking')

  // --- Asphalt line ---------------------------------------------------------
  // heavy_oil -> bitumen -> asphalt_mixture -> liquid_asphalt -> asphalt block

  event.remove({ id: 'tfmg:mixing/liquid_asphalt' })
  event.recipes.create.mixing(
    Fluid.of('tfmg:liquid_asphalt', 1000),
    ['tfmg:asphalt_mixture', Fluid.of('minecraft:water', 250)]
  )
    .heated()
    .id('kubejs:petrochem/mixing/liquid_asphalt')

  // Basin fluid tank caps at 144 mB — 250 mB recipes never fire.
  event.custom({
    type: 'tfmg:casting',
    ingredients: [
      { type: 'neoforge:single', amount: 144, fluid: 'tfmg:liquid_asphalt' }
    ],
    processing_time: 100,
    results: [
      { id: 'tfmg:asphalt' }
    ]
  }).id('kubejs:petrochem/casting/asphalt')

  // Create Basin path (black basin + heat) — same fluid cost, no TFMG casting basin required.
  event.recipes.create.compacting('tfmg:asphalt', Fluid.of('tfmg:liquid_asphalt', 144))
    .heated()
    .id('kubejs:petrochem/compacting/asphalt')

  // --- Cross-mod integration ------------------------------------------------

  event.replaceInput(
    { id: 'create_new_age:shaped/carbon_brushes' },
    'minecraft:coal',
    'tfmg:coal_coke_dust'
  )
})