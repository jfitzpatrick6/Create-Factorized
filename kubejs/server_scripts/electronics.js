// priority: 4
// Electronics progression — issue #4
//
// Baselines (CNA 1.2.0 / TFMG 1.2.0 defaults):
//   generator_coil: 8x copper ingot + andesite alloy block
//   energising/overcharged_iron: 1 iron (1000 FE) — gated via energiser billet + mixing
//   energising/overcharged_gold: 1 gold (2000 FE) — gated via energiser billet + mixing
//   energising/overcharged_diamond: 1 diamond (10000 FE) — gated via energiser billet + mixing
//   blank_circuit -> copper_circuit (CNA parallel path — removed)
//   motor extensions: copper_circuit -> tfmg:circuit_board (pack redirect)
//   deployer: electron_tube -> kubejs:control_unit (pack gate)

ServerEvents.tags('item', event => {
  event.add('c:wires/copper', 'create_new_age:copper_wire')
})

ServerEvents.recipes(event => {
  // --- TFMG-primary: remove CNA parallel circuit chain ----------------------

  event.remove({ id: 'create_new_age:compacting/blank_circuit' })
  event.remove({ id: 'create_new_age:deploying/copper_circuit' })

  event.shapeless('tfmg:copper_wire', '4x create_new_age:copper_wire')
    .id('kubejs:electronics/convert_cna_copper_wire')

  // --- CNA conductor / coil rebalance ---------------------------------------

  event.remove({ id: 'create_new_age:shaped/generator_coil' })
  event.shaped('create_new_age:generator_coil', [
    'E',
    'A',
    'S'
  ], {
    E: 'tfmg:etched_circuit_board',
    A: 'create:andesite_alloy_block',
    S: 'tfmg:copper_spool'
  }).id('kubejs:electronics/generator_coil')

  // CNA energising accepts exactly one item input — prep materials via mixing first.
  event.recipes.create.mixing('kubejs:iron_energiser_billet', [
    '2x minecraft:iron_ingot',
    '4x minecraft:redstone'
  ]).id('kubejs:electronics/mixing/iron_energiser_billet')

  event.recipes.create.mixing('kubejs:gold_energiser_billet', [
    '2x minecraft:gold_ingot',
    'tfmg:cooling_fluid_bottle',
    '4x minecraft:redstone'
  ]).id('kubejs:electronics/mixing/gold_energiser_billet')

  event.recipes.create.mixing('kubejs:diamond_energiser_billet', [
    'minecraft:diamond',
    'tfmg:lithium_ingot',
    'tfmg:cooling_fluid_bottle'
  ]).id('kubejs:electronics/mixing/diamond_energiser_billet')

  event.remove({ id: 'create_new_age:energising/overcharged_iron' })
  event.custom({
    type: 'create_new_age:energising',
    energy_needed: 1000,
    ingredients: [{ item: 'kubejs:iron_energiser_billet' }],
    results: [{ id: 'create_new_age:overcharged_iron' }]
  }).id('kubejs:electronics/energising/overcharged_iron')

  event.remove({ id: 'create_new_age:energising/overcharged_gold' })
  event.custom({
    type: 'create_new_age:energising',
    energy_needed: 2000,
    ingredients: [{ item: 'kubejs:gold_energiser_billet' }],
    results: [{ id: 'create_new_age:overcharged_gold' }]
  }).id('kubejs:electronics/energising/overcharged_gold')

  event.remove({ id: 'create_new_age:energising/overcharged_diamond' })
  event.custom({
    type: 'create_new_age:energising',
    energy_needed: 10000,
    ingredients: [{ item: 'kubejs:diamond_energiser_billet' }],
    results: [{ id: 'create_new_age:overcharged_diamond' }]
  }).id('kubejs:electronics/energising/overcharged_diamond')

  event.replaceInput(
    { id: 'create_new_age:shaped/basic_motor_extension' },
    'create_new_age:copper_circuit',
    'tfmg:circuit_board'
  )

  event.replaceInput(
    { id: 'create_new_age:mechanical_crafting/advanced_motor_extension' },
    'create_new_age:copper_circuit',
    'tfmg:circuit_board'
  )

  // --- Control unit (TFMG circuit board investment) -------------------------

  event.recipes.create.sequenced_assembly([
    Item.of('kubejs:control_unit')
  ], 'tfmg:circuit_board', [
    event.recipes.create.deploying('kubejs:incomplete_control_unit', [
      'kubejs:incomplete_control_unit',
      'tfmg:steel_mechanism'
    ]),
    event.recipes.create.deploying('kubejs:incomplete_control_unit', [
      'kubejs:incomplete_control_unit',
      'tfmg:copper_spool'
    ]),
    event.recipes.create.pressing('kubejs:incomplete_control_unit', 'kubejs:incomplete_control_unit')
  ])
    .loops(1)
    .transitionalItem('kubejs:incomplete_control_unit')
    .id('kubejs:electronics/sequenced_assembly/control_unit')

  // --- Create machine gates -------------------------------------------------

  event.replaceInput(
    { id: 'create:crafting/kinetics/deployer' },
    'create:electron_tube',
    'kubejs:control_unit'
  )

  event.replaceInput(
    { id: 'create:crafting/kinetics/smart_fluid_pipe' },
    'create:electron_tube',
    'kubejs:control_unit'
  )

  event.remove({ id: 'create:crafting/kinetics/rotation_speed_controller' })
  event.shaped('create:rotation_speed_controller', [
    'P',
    'U',
    'C'
  ], {
    P: 'create:precision_mechanism',
    U: 'kubejs:control_unit',
    C: 'create:brass_casing'
  }).id('kubejs:electronics/rotation_speed_controller')

  // --- CNA reactor gating (lithium + plastic) --------------------------------

  event.remove({ id: 'create_new_age:sequenced_assembly/reactor_casing' })
  event.custom({
    type: 'create:sequenced_assembly',
    ingredient: { item: 'minecraft:bricks' },
    transitional_item: { id: 'create_new_age:incomplete_reactor_casing' },
    sequence: [
      {
        type: 'create_new_age:energising',
        energy_needed: 500,
        ingredients: [{ item: 'create_new_age:incomplete_reactor_casing' }],
        results: [{ id: 'create_new_age:incomplete_reactor_casing' }]
      },
      {
        type: 'create:deploying',
        ingredients: [
          { item: 'create_new_age:incomplete_reactor_casing' },
          { tag: 'c:plates/iron' }
        ],
        results: [{ id: 'create_new_age:incomplete_reactor_casing' }]
      },
      {
        type: 'create:deploying',
        ingredients: [
          { item: 'create_new_age:incomplete_reactor_casing' },
          { item: 'tfmg:plastic_sheet' }
        ],
        results: [{ id: 'create_new_age:incomplete_reactor_casing' }]
      },
      {
        type: 'create:pressing',
        ingredients: [{ item: 'create_new_age:incomplete_reactor_casing' }],
        results: [{ id: 'create_new_age:incomplete_reactor_casing' }]
      }
    ],
    results: [{ count: 4, id: 'create_new_age:reactor_casing' }]
  }).id('kubejs:electronics/reactor_casing')

  event.remove({ id: 'create_new_age:sequenced_assembly/nuclear_fuel' })
  event.custom({
    type: 'create:sequenced_assembly',
    ingredient: { item: 'create_new_age:radioactive_thorium' },
    transitional_item: { id: 'create_new_age:incomplete_fuel' },
    sequence: [
      {
        type: 'create:pressing',
        ingredients: [{ item: 'create_new_age:incomplete_fuel' }],
        results: [{ id: 'create_new_age:incomplete_fuel' }]
      },
      {
        type: 'create:deploying',
        ingredients: [
          { item: 'create_new_age:incomplete_fuel' },
          { tag: 'c:plates/iron' }
        ],
        results: [{ id: 'create_new_age:incomplete_fuel' }]
      },
      {
        type: 'create:deploying',
        ingredients: [
          { item: 'create_new_age:incomplete_fuel' },
          { item: 'tfmg:lithium_ingot' }
        ],
        results: [{ id: 'create_new_age:incomplete_fuel' }]
      },
      {
        type: 'create:pressing',
        ingredients: [{ item: 'create_new_age:incomplete_fuel' }],
        results: [{ id: 'create_new_age:incomplete_fuel' }]
      }
    ],
    results: [{ id: 'create_new_age:nuclear_fuel' }]
  }).id('kubejs:electronics/nuclear_fuel')

  event.remove({ id: 'create_new_age:mechanical_crafting/reactor_rod' })
  event.recipes.create.mechanical_crafting(
    Item.of('create_new_age:reactor_rod', 2),
    [
      'SCPPC',
      ' GFG ',
      ' GFG ',
      'SCPPC'
    ],
    {
      S: 'tfmg:plastic_sheet',
      C: 'create_new_age:reactor_casing',
      P: '#c:plates/gold',
      G: 'create_new_age:reactor_glass',
      F: 'create_new_age:nuclear_fuel'
    }
  ).id('kubejs:electronics/reactor_rod')
})