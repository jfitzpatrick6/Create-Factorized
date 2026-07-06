// priority: 4
// Building stone automation — issue #9
//
// Synthesis for worldgen-only / uncraftable base stones only.
// Does NOT duplicate existing Create routes (e.g. gravel → sand via crushing,
// mud via create:mixing/mud_by_mixing). Downstream variants use stonecutter /
// Chipped / Rechiseled once base blocks flow.
//
//   Phase 2: calcite, tuff, cobbled_deepslate → deepslate (vanilla smelt), dripstone, packed_mud
//   Phase 2b: tfmg galena, bauxite, lignite, fireclay
//   Phase 2c: amethyst block + budding amethyst (renewable geode farms)
//   Phase 3: create limestone, asurine, crimsite, scoria, scorchia, ochrum, veridium
//   Phase 4: basalt, blackstone
//
// Polished deepslate: smelt/blast cobbled_deepslate (vanilla) — not synthesized directly.

function defineStoneMix(event, config) {
  var recipe = global.CreateRecipes.mixing(event, config.output, config.inputs)
  if (config.heat === 'superheated') {
    recipe.superheated()
  } else if (config.heat === 'heated') {
    recipe.heated()
  }
  recipe.id('kubejs:building_stones/' + config.id)
}

function defineStoneCompact(event, config) {
  var recipe = global.CreateRecipes.compacting(event, config.output, config.inputs)
  if (config.heat) {
    recipe.heated()
  }
  recipe.id('kubejs:building_stones/' + config.id)
}

ServerEvents.tags('item', event => {
  event.add('kubejs:lithified_stone_inputs', [
    'minecraft:cobblestone',
    'minecraft:stone',
    'minecraft:gravel',
    'minecraft:sand',
    'minecraft:andesite',
    'minecraft:diorite',
    'minecraft:granite',
    'minecraft:deepslate',
    'minecraft:cobbled_deepslate',
    'minecraft:calcite',
    'minecraft:tuff',
    'minecraft:basalt',
    'minecraft:blackstone'
  ])

  event.add('kubejs:sedimentary_stones', [
    'minecraft:sandstone',
    'minecraft:red_sandstone',
    'minecraft:calcite',
    'create:limestone',
    'tfmg:bauxite',
    'tfmg:galena',
    'tfmg:lignite'
  ])
})

ServerEvents.recipes(event => {
  // --- Phase 2: Rare overworld stones (flux / steel era) --------------------

  defineStoneMix(event, {
    id: 'calcite_lithification',
    output: '2x minecraft:calcite',
    inputs: [
      '2x minecraft:sandstone',
      '4x minecraft:bone_meal',
      '#tfmg:flux',
      Fluid.of('minecraft:water', 500)
    ],
    heat: 'heated'
  })

  defineStoneCompact(event, {
    id: 'tuff_compaction',
    output: '4x minecraft:tuff',
    inputs: [
      '2x minecraft:gravel',
      '2x minecraft:clay_ball',
      '2x minecraft:cobblestone'
    ]
  })

  defineStoneMix(event, {
    id: 'cobbled_deepslate_lithification',
    output: '4x minecraft:cobbled_deepslate',
    inputs: [
      '4x minecraft:stone',
      '2x minecraft:charcoal',
      '#tfmg:flux',
      Fluid.of('minecraft:lava', 250)
    ],
    heat: 'superheated'
  })

  defineStoneMix(event, {
    id: 'dripstone_crystallization',
    output: '2x minecraft:dripstone_block',
    inputs: [
      '4x minecraft:calcite',
      Fluid.of('minecraft:water', 1000)
    ],
    heat: 'heated'
  })

  global.CreateRecipes.crushing(event, [
    Item.of('minecraft:pointed_dripstone', 4),
    global.CreateItem.of('minecraft:clay_ball', 0.25)
  ], 'minecraft:dripstone_block')
    .processingTime(300)
    .id('kubejs:building_stones/dripstone_to_pointed')

  defineStoneMix(event, {
    id: 'packed_mud_from_mud',
    output: '2x minecraft:packed_mud',
    inputs: [
      'minecraft:mud',
      'minecraft:wheat'
    ]
  })

  // --- Phase 2b: TFMG striated ore stones -----------------------------------

  defineStoneMix(event, {
    id: 'galena_lead_ore',
    output: '2x tfmg:galena',
    inputs: [
      '2x minecraft:cobbled_deepslate',
      '4x tfmg:lead_nugget',
      'tfmg:sulfur_dust',
      '#tfmg:flux'
    ],
    heat: 'heated'
  })

  defineStoneMix(event, {
    id: 'bauxite_aluminum_ore',
    output: '2x tfmg:bauxite',
    inputs: [
      '2x minecraft:cobbled_deepslate',
      '2x minecraft:clay_ball',
      '#c:ingots/aluminum',
      Fluid.of('minecraft:water', 250)
    ],
    heat: 'heated'
  })

  defineStoneMix(event, {
    id: 'lignite_coal_bed',
    output: '2x tfmg:lignite',
    inputs: [
      'minecraft:cobbled_deepslate',
      '2x minecraft:coal',
      'minecraft:clay_ball'
    ],
    heat: 'heated'
  })

  defineStoneMix(event, {
    id: 'fireclay_balls',
    output: '4x tfmg:fireclay_ball',
    inputs: [
      '4x minecraft:clay_ball',
      'minecraft:coal',
      Fluid.of('minecraft:lava', 250)
    ],
    heat: 'heated'
  })

  defineStoneCompact(event, {
    id: 'fireclay_from_balls',
    output: 'tfmg:fireclay',
    inputs: ['4x tfmg:fireclay_ball']
  })

  // --- Phase 2c: Amethyst renewability --------------------------------------

  defineStoneMix(event, {
    id: 'amethyst_block_crystallization',
    output: 'minecraft:amethyst_block',
    inputs: [
      '4x minecraft:amethyst_shard',
      '2x minecraft:calcite',
      Fluid.of('minecraft:water', 500)
    ],
    heat: 'heated'
  })

  defineStoneMix(event, {
    id: 'budding_amethyst_seed',
    output: 'minecraft:budding_amethyst',
    inputs: [
      'minecraft:amethyst_block',
      '2x minecraft:amethyst_shard',
      'minecraft:calcite'
    ],
    heat: 'superheated'
  })

  // --- Phase 4a: Nether stones (before volcanic Create types) ---------------

  defineStoneMix(event, {
    id: 'basalt_from_coke_lava',
    output: '4x minecraft:basalt',
    inputs: [
      '2x minecraft:stone',
      'tfmg:coal_coke',
      Fluid.of('minecraft:lava', 500)
    ],
    heat: 'superheated'
  })

  // --- Phase 3: Create worldgen stone types ---------------------------------

  defineStoneMix(event, {
    id: 'limestone_sediment',
    output: '2x create:limestone',
    inputs: [
      '2x minecraft:sandstone',
      'minecraft:calcite',
      Fluid.of('minecraft:water', 500)
    ],
    heat: 'heated'
  })

  defineStoneMix(event, {
    id: 'asurine_patina',
    output: '2x create:asurine',
    inputs: [
      'create:limestone',
      '4x create:copper_nugget',
      Fluid.of('minecraft:water', 500)
    ],
    heat: 'heated'
  })

  defineStoneMix(event, {
    id: 'ochrum_sediment',
    output: '2x create:ochrum',
    inputs: [
      '2x minecraft:sandstone',
      'minecraft:gold_nugget',
      'minecraft:clay_ball'
    ],
    heat: 'heated'
  })

  defineStoneMix(event, {
    id: 'veridium_copper_moss',
    output: '2x create:veridium',
    inputs: [
      'create:limestone',
      '4x create:copper_nugget',
      'minecraft:moss_block'
    ],
    heat: 'heated'
  })

  defineStoneMix(event, {
    id: 'scoria_volcanic',
    output: '2x create:scoria',
    inputs: [
      '2x minecraft:basalt',
      'tfmg:coal_coke',
      'minecraft:magma_cream'
    ],
    heat: 'superheated'
  })

  defineStoneMix(event, {
    id: 'scorchia_nether',
    output: '2x create:scorchia',
    inputs: [
      'create:scoria',
      'minecraft:blaze_powder',
      'minecraft:coal'
    ],
    heat: 'superheated'
  })

  defineStoneMix(event, {
    id: 'crimsite_oxide',
    output: '2x create:crimsite',
    inputs: [
      'create:scoria',
      '4x minecraft:iron_nugget',
      Fluid.of('minecraft:lava', 250)
    ],
    heat: 'superheated'
  })

  // --- Phase 4b: Nether polish ----------------------------------------------

  defineStoneCompact(event, {
    id: 'blackstone_from_basalt',
    output: '2x minecraft:blackstone',
    inputs: [
      '2x minecraft:basalt',
      'tfmg:coal_coke_dust'
    ],
    heat: true
  })
})