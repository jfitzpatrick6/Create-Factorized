// priority: 4
// Building stone automation — issue #9
//
// Synthesis for worldgen-only / uncraftable base stones only.
// Does NOT duplicate existing Create routes (e.g. gravel → sand via crushing,
// mud via create:mixing/mud_by_mixing). Downstream variants use stonecutter /
// Chipped / Rechiseled once base blocks flow.
//
//   Phase 2: calcite, tuff, deepslate, dripstone_block, packed_mud
//   Phase 3: create limestone, asurine, crimsite, scoria, scorchia, ochrum, veridium
//   Phase 4: basalt, blackstone

function defineStoneMix(event, config) {
  var recipe = event.recipes.create.mixing(config.output, config.inputs)
  if (config.heat === 'superheated') {
    recipe.superheated()
  } else if (config.heat === 'heated') {
    recipe.heated()
  }
  recipe.id('kubejs:building_stones/' + config.id)
}

function defineStoneCompact(event, config) {
  var recipe = event.recipes.create.compacting(config.output, config.inputs)
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
    'create:limestone'
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
    id: 'deepslate_lithification',
    output: '4x minecraft:deepslate',
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

  defineStoneMix(event, {
    id: 'packed_mud_from_mud',
    output: '2x minecraft:packed_mud',
    inputs: [
      'minecraft:mud',
      'minecraft:wheat'
    ]
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