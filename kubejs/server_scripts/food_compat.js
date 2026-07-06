// priority: 5
// Food automation + nutrition synergy — issue #6
//
//   Phase 1: Fix FD Extended Create recipes (broken fluid_stack / fluid_tag JSON)
//   Phase 3: Fortified seasoning from Expanded Delight crops
//   Phase 4: Factory worker meals (Nourished-tuned via food_overrides.json)
//   Phase 5: Aged cheese + factory lunchbox luxury chain
//
// Canonicals: create:wheat_flour, create:dough (unification.js)

var FDE_MIXING_FIXES = [
  {
    id: 'battered_chicken',
    output: 'farmersdelight_extended:battered_chicken',
    inputs: ['#c:flours/wheat', 'farmersdelight:chicken_cuts', Fluid.of('minecraft:water', 250)]
  },
  {
    id: 'battered_cod',
    output: 'farmersdelight_extended:battered_cod',
    inputs: ['#c:flours/wheat', 'farmersdelight:cod_slice', Fluid.of('minecraft:water', 250)]
  },
  {
    id: 'battered_mushroom',
    output: 'farmersdelight_extended:battered_mushroom',
    inputs: ['#c:flours/wheat', 'minecraft:red_mushroom', Fluid.of('minecraft:water', 250)]
  },
  {
    id: 'brownie_batter',
    output: 'farmersdelight_extended:brownie_batter',
    inputs: [
      '#c:flours/wheat',
      'minecraft:cocoa_beans',
      'minecraft:sugar',
      'minecraft:egg',
      Fluid.of('minecraft:water', 250)
    ]
  },
  {
    id: 'fresh_cheese',
    output: 'farmersdelight_extended:fresh_cheese',
    inputs: [Fluid.of('minecraft:milk', 1000)],
    heat: 'heated'
  },
  {
    id: 'icecream_scoop',
    output: 'farmersdelight_extended:icecream_scoop',
    inputs: [
      'minecraft:sugar',
      '4x minecraft:snowball',
      Fluid.of('minecraft:milk', 250)
    ]
  }
]

function removeFdeCreateRecipes(event, suffix) {
  FDE_MIXING_FIXES.forEach(function (recipe) {
    event.remove({ id: 'farmersdelight_extended:' + suffix + '/' + recipe.id })
  })
  event.remove({ id: 'farmersdelight_extended:filling/chocolate_roll' })
  event.remove({ id: 'farmersdelight_extended:filling/honey_roll' })
  event.remove({ id: 'farmersdelight_extended:compacting/chocolate_graham_cracker' })
  event.remove({ id: 'farmersdelight_extended:sequenced_assembly/mochi' })
}

function registerFdeMixingFixes(event) {
  FDE_MIXING_FIXES.forEach(function (recipe) {
    var mix = global.CreateRecipes.mixing(event, recipe.output, recipe.inputs)
    if (recipe.heat === 'heated') {
      mix.heated()
    }
    mix.id('kubejs:food_compat/fde_mixing/' + recipe.id)
  })
}

function registerFdeFillingFixes(event) {
  global.CreateRecipes.filling(event, 'farmersdelight_extended:chocolate_roll', [
    'minecraft:bread',
    Fluid.of('create:chocolate', 250)
  ]).id('kubejs:food_compat/fde_filling/chocolate_roll')

  global.CreateRecipes.filling(event, 'farmersdelight_extended:honey_roll', [
    'minecraft:bread',
    Fluid.of('create:honey', 250)
  ]).id('kubejs:food_compat/fde_filling/honey_roll')
}

function registerFdeCompactingFixes(event) {
  global.CreateRecipes.compacting(event, '4x farmersdelight_extended:chocolate_graham_cracker', [
    'minecraft:cocoa_beans',
    Fluid.of('create:honey', 250),
    '#c:flours/wheat'
  ])
    .heated()
    .id('kubejs:food_compat/fde_compacting/chocolate_graham_cracker')
}

function registerFdeMochiAssembly(event) {
  global.CreateRecipes.sequenced_assembly(event, [
    Item.of('farmersdelight_extended:mochi')
  ], 'farmersdelight_extended:rice_flour', [
    global.CreateRecipes.filling(event, 'farmersdelight_extended:unprocessed_mochi', [
      'farmersdelight_extended:unprocessed_mochi',
      Fluid.of('minecraft:water', 250)
    ]),
    global.CreateRecipes.deploying(event, 'farmersdelight_extended:unprocessed_mochi', [
      'farmersdelight_extended:unprocessed_mochi',
      'minecraft:sugar'
    ]),
    global.CreateRecipes.pressing(event, 'farmersdelight_extended:unprocessed_mochi', 'farmersdelight_extended:unprocessed_mochi'),
    global.CreateRecipes.pressing(event, 'farmersdelight_extended:unprocessed_mochi', 'farmersdelight_extended:unprocessed_mochi')
  ])
    .loops(1)
    .transitionalItem('farmersdelight_extended:unprocessed_mochi')
    .id('kubejs:food_compat/fde_sequenced_assembly/mochi')
}

ServerEvents.tags('item', event => {
  event.add('kubejs:factory_meals', [
    'kubejs:ore_worker_stew',
    'kubejs:hearty_broth',
    'kubejs:vein_scout_snack',
    'kubejs:luxury_chocolate_bar',
    'kubejs:factory_lunchbox'
  ])
})

ServerEvents.recipes(event => {
  // --- Phase 1: FD Extended Create recipe fixes -------------------------------

  removeFdeCreateRecipes(event, 'mixing')
  registerFdeMixingFixes(event)
  registerFdeFillingFixes(event)
  registerFdeCompactingFixes(event)
  registerFdeMochiAssembly(event)

  // --- Phase 3: Spice intermediate ------------------------------------------

  global.CreateRecipes.mixing(event, 'kubejs:fortified_seasoning', [
    'expandeddelight:chili_pepper',
    'expandeddelight:cinnamon_stick',
    Fluid.of('tfmg:lubrication_oil', 50)
  ])
    .heated()
    .id('kubejs:food_compat/mixing/fortified_seasoning')

  // --- Phase 4: Factory worker meals ----------------------------------------

  global.CreateRecipes.mixing(event, 'kubejs:ore_worker_stew', [
    '2x minecraft:cooked_beef',
    '2x minecraft:carrot',
    'kubejs:fortified_seasoning',
    Fluid.of('minecraft:water', 250)
  ])
    .heated()
    .id('kubejs:food_compat/mixing/ore_worker_stew')

  global.CreateRecipes.mixing(event, 'kubejs:hearty_broth', [
    '2x minecraft:bone',
    '2x minecraft:potato',
    'expandeddelight:asparagus',
    Fluid.of('minecraft:water', 500)
  ])
    .heated()
    .processingTime(400)
    .id('kubejs:food_compat/mixing/hearty_broth')

  global.CreateRecipes.compacting(event, 'kubejs:vein_scout_snack', [
    '2x farmersdelight_extended:toast',
    'expandeddelight:cranberries',
    'expandeddelight:peanut'
  ]).id('kubejs:food_compat/compacting/vein_scout_snack')

  // --- Phase 5: Luxury / aged chain -----------------------------------------

  global.CreateRecipes.mixing(event, 'kubejs:aged_cheese_wheel', [
    '2x farmersdelight_extended:fresh_cheese'
  ])
    .heated()
    .processingTime(600)
    .id('kubejs:food_compat/mixing/aged_cheese_wheel')

  global.CreateRecipes.cutting(event, [
    Item.of('kubejs:aged_cheese_slice', 4)
  ], 'kubejs:aged_cheese_wheel')
    .id('kubejs:food_compat/cutting/aged_cheese_wheel')

  global.CreateRecipes.compacting(event, 'kubejs:luxury_chocolate_bar', [
    'minecraft:cocoa_beans',
    'minecraft:sugar',
    Fluid.of('create:chocolate', 250)
  ])
    .heated()
    .id('kubejs:food_compat/compacting/luxury_chocolate_bar')

  global.CreateRecipes.sequenced_assembly(event, [
    Item.of('kubejs:factory_lunchbox')
  ], 'farmersdelight_extended:bread_slice', [
    global.CreateRecipes.deploying(event, 'kubejs:incomplete_lunchbox', [
      'farmersdelight_extended:bread_slice',
      'kubejs:aged_cheese_slice'
    ]),
    global.CreateRecipes.deploying(event, 'kubejs:incomplete_lunchbox', [
      'kubejs:incomplete_lunchbox',
      'farmersdelight_extended:toast'
    ]),
    global.CreateRecipes.pressing(event, 'kubejs:incomplete_lunchbox', 'kubejs:incomplete_lunchbox')
  ])
    .loops(1)
    .transitionalItem('kubejs:incomplete_lunchbox')
    .id('kubejs:food_compat/sequenced_assembly/factory_lunchbox')
})