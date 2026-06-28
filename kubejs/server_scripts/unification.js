// priority: 0
// Reload-safe unification — KubeJS 7 only allows global.* assignment in startup_scripts.

var CANONICAL = {
  steelIngot: 'tfmg:steel_ingot',
  steelNugget: 'tfmg:steel_nugget',
  steelBlock: 'tfmg:steel_block',
  steelPlate: 'tfmg:heavy_plate',
  castIronIngot: 'tfmg:cast_iron_ingot',
  castIronNugget: 'tfmg:cast_iron_nugget',
  castIronBlock: 'tfmg:cast_iron_block',
  leadIngot: 'tfmg:lead_ingot',
  leadNugget: 'tfmg:lead_nugget',
  rawLead: 'tfmg:raw_lead',
  sulfurDust: 'tfmg:sulfur_dust',
  saltpeterDust: 'tfmg:nitrate_dust',
  breadSlice: 'farmersdelight_extended:bread_slice',
  toast: 'farmersdelight_extended:toast',
  flour: 'create:wheat_flour',
  dough: 'create:dough',
  bread: 'minecraft:bread',
  experienceFluid: 'create_enchantment_industry:experience',
  experienceBucket: 'create_enchantment_industry:experience_bucket'
}

var EXPERIENCE_FLUID_VARIANTS = [
  'sophisticatedcore:xp_still',
  'sophisticatedcore:xp_flow'
]

var EXPERIENCE_BUCKET_VARIANTS = [
  'sophisticatedcore:xp_bucket'
]

var STEEL_VARIANTS = [
  'createbigcannons:steel_ingot',
  'cgs:steel_ingot'
]

var STEEL_NUGGET_VARIANTS = [
  'cgs:steel_nugget',
  'createbigcannons:steel_scrap'
]

var STEEL_BLOCK_VARIANTS = [
  'createbigcannons:steel_block',
  'cgs:steel_block'
]

var STEEL_PLATE_VARIANTS = [
  'cgs:steel_sheet'
]

var CAST_IRON_VARIANTS = [
  'createbigcannons:cast_iron_ingot'
]

var CAST_IRON_NUGGET_VARIANTS = [
  'createbigcannons:cast_iron_nugget'
]

var CAST_IRON_BLOCK_VARIANTS = [
  'createbigcannons:cast_iron_block'
]

var LEAD_INGOT_VARIANTS = [
  'cgs:lead_ingot'
]

var LEAD_NUGGET_VARIANTS = [
  'cgs:lead_nugget'
]

var RAW_LEAD_VARIANTS = [
  'cgs:raw_lead'
]

var SULFUR_DUST_VARIANTS = [
  'cgs:sulfur'
]

var SALTPETER_DUST_VARIANTS = [
  'cgs:niter'
]

var BREAD_SLICE_VARIANTS = [
  'moredelight:bread_slice'
]

var TOAST_VARIANTS = [
  'moredelight:toast'
]

function concat(base, extra) {
  return extra ? base.concat(extra) : base
}

ServerEvents.tags('item', event => {
  var C = CANONICAL

  event.add('c:ingots/steel', concat([C.steelIngot], STEEL_VARIANTS))
  event.add('c:nuggets/steel', concat([C.steelNugget], STEEL_NUGGET_VARIANTS))
  event.add('c:storage_blocks/steel', concat([C.steelBlock], STEEL_BLOCK_VARIANTS))
  event.add('c:plates/steel', concat([C.steelPlate], STEEL_PLATE_VARIANTS))

  event.add('c:ingots/cast_iron', concat([C.castIronIngot], CAST_IRON_VARIANTS))
  event.add('c:nuggets/cast_iron', concat([C.castIronNugget], CAST_IRON_NUGGET_VARIANTS))
  event.add('c:storage_blocks/cast_iron', concat([C.castIronBlock], CAST_IRON_BLOCK_VARIANTS))

  event.add('c:ingots/lead', concat([C.leadIngot], LEAD_INGOT_VARIANTS))
  event.add('c:nuggets/lead', concat([C.leadNugget], LEAD_NUGGET_VARIANTS))
  event.add('c:raw_materials/lead', concat([C.rawLead], RAW_LEAD_VARIANTS))

  event.add('c:dusts/sulfur', concat([C.sulfurDust], SULFUR_DUST_VARIANTS))
  event.add('c:dusts/saltpeter', concat([C.saltpeterDust], SALTPETER_DUST_VARIANTS))

  event.add('c:bread_slices/wheat', concat(concat([C.breadSlice], BREAD_SLICE_VARIANTS), [C.toast]))
  event.add('c:bread_slices', concat(concat([C.breadSlice], BREAD_SLICE_VARIANTS), [C.toast]))
  event.add('c:flours/wheat', [C.flour])
  event.add('c:foods/dough/wheat', [C.dough])
  event.add('c:foods/dough', [C.dough])

  event.add('c:experience_buckets', concat([C.experienceBucket], EXPERIENCE_BUCKET_VARIANTS))

  event.add('c:tools/knife', [
    'moredelight:wooden_knife',
    'moredelight:stone_knife',
    'farmersdelight:flint_knife',
    'farmersdelight:iron_knife',
    'farmersdelight:golden_knife',
    'farmersdelight:diamond_knife',
    'ends_delight:dragon_egg_shell_knife',
    'ends_delight:end_stone_knife',
    'ends_delight:purpur_knife',
    'ends_delight:dragon_tooth_knife'
  ])
})

ServerEvents.tags('fluid', event => {
  var C = CANONICAL

  event.add('c:experience', concat([
    C.experienceFluid,
    'create_enchantment_industry:flowing_experience'
  ], EXPERIENCE_FLUID_VARIANTS))
})

ServerEvents.recipes(event => {
  var C = CANONICAL

  function bidirectional(from, to, label) {
    event.shapeless(to, from).id('kubejs:unify/' + label)
    event.shapeless(from, to).id('kubejs:unify/' + label + '_reverse')
  }

  function unify(variants, canonical, prefix) {
    variants.forEach(function (variant) {
      bidirectional(variant, canonical, prefix + '_' + variant.replace(':', '_'))
    })
  }

  unify(STEEL_VARIANTS, C.steelIngot, 'steel')
  unify(STEEL_NUGGET_VARIANTS, C.steelNugget, 'steel_nugget')
  unify(STEEL_BLOCK_VARIANTS, C.steelBlock, 'steel_block')
  unify(STEEL_PLATE_VARIANTS, C.steelPlate, 'steel_plate')

  unify(CAST_IRON_VARIANTS, C.castIronIngot, 'cast_iron')
  unify(CAST_IRON_NUGGET_VARIANTS, C.castIronNugget, 'cast_iron_nugget')
  unify(CAST_IRON_BLOCK_VARIANTS, C.castIronBlock, 'cast_iron_block')

  unify(LEAD_INGOT_VARIANTS, C.leadIngot, 'lead')
  unify(LEAD_NUGGET_VARIANTS, C.leadNugget, 'lead_nugget')
  unify(RAW_LEAD_VARIANTS, C.rawLead, 'raw_lead')

  unify(SULFUR_DUST_VARIANTS, C.sulfurDust, 'sulfur_dust')
  unify(SALTPETER_DUST_VARIANTS, C.saltpeterDust, 'saltpeter_dust')

  BREAD_SLICE_VARIANTS.forEach(function (variant) {
    bidirectional(variant, C.breadSlice, 'bread_slice_' + variant.replace(':', '_'))
  })

  TOAST_VARIANTS.forEach(function (variant) {
    bidirectional(variant, C.toast, 'toast_' + variant.replace(':', '_'))
  })

  event.remove({ id: 'minecraft:bread' })
  event.remove({ id: 'farmersdelight:wheat_dough_from_water' })
  event.remove({ id: 'farmersdelight:wheat_dough_from_eggs' })
  event.remove({ id: 'farmersdelight:wheat_dough_from_egg' })
  event.remove({ id: 'farmersdelight:bread_from_smelting' })
  event.remove({ id: 'farmersdelight:bread_from_smoking' })

  event.shapeless(C.dough, 'farmersdelight:wheat_dough').id('kubejs:convert/farmersdelight_wheat_dough')

  unify(EXPERIENCE_BUCKET_VARIANTS, C.experienceBucket, 'experience_bucket')

  event.replaceInput({ mod: 'moredelight', input: 'moredelight:toast' }, 'moredelight:toast', C.toast)
  event.replaceInput({ mod: 'moredelight', input: 'moredelight:bread_slice' }, 'moredelight:bread_slice', C.breadSlice)

  event.replaceInput({ mod: 'cgs', input: 'cgs:steel_ingot' }, 'cgs:steel_ingot', '#c:ingots/steel')
  event.replaceInput({ mod: 'cgs', input: 'cgs:steel_nugget' }, 'cgs:steel_nugget', '#c:nuggets/steel')
  event.replaceInput({ mod: 'cgs', input: 'cgs:steel_sheet' }, 'cgs:steel_sheet', '#c:plates/steel')
  event.replaceInput({ mod: 'cgs', input: 'cgs:lead_ingot' }, 'cgs:lead_ingot', '#c:ingots/lead')
  event.replaceInput({ mod: 'cgs', input: 'cgs:sulfur' }, 'cgs:sulfur', '#c:dusts/sulfur')
  event.replaceInput({ mod: 'cgs', input: 'cgs:niter' }, 'cgs:niter', '#c:dusts/saltpeter')

  event.replaceOutput({ mod: 'cgs', output: 'cgs:steel_ingot' }, 'cgs:steel_ingot', C.steelIngot)
  event.replaceOutput({ mod: 'cgs', output: 'cgs:lead_ingot' }, 'cgs:lead_ingot', C.leadIngot)

  event.remove({ id: 'moredelight:cutting/bread_slice' })
  event.remove({ id: 'moredelight:cutting/bread_to_bread_slices' })
  event.remove({ id: 'moredelight:wooden_knife' })
  event.remove({ id: 'moredelight:stone_knife' })

  event.remove({ id: 'moredelight:toast_campfire_cooking' })
  event.remove({ id: 'moredelight:toast_smelting' })
  event.remove({ id: 'moredelight:toast_smoking' })

  event.remove({ id: 'farmersdelight:melon_juice' })
})