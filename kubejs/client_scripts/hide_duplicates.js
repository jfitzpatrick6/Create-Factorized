// Hide secondary duplicate items from JEI.

RecipeViewerEvents.removeEntries('item', event => {
  var hidden = [
    'createbigcannons:steel_ingot',
    'createbigcannons:steel_block',
    'createbigcannons:steel_scrap',
    'createbigcannons:cast_iron_ingot',
    'createbigcannons:cast_iron_nugget',
    'createbigcannons:cast_iron_block',
    'cgs:steel_ingot',
    'cgs:steel_nugget',
    'cgs:steel_block',
    'cgs:steel_sheet',
    'cgs:lead_ingot',
    'cgs:lead_nugget',
    'cgs:raw_lead',
    'cgs:sulfur',
    'cgs:niter',
    'farmersdelight:wheat_dough',
    'moredelight:bread_slice',
    'moredelight:toast',
    'moredelight:wooden_knife',
    'moredelight:stone_knife'
  ]

  for (var i = 0; i < hidden.length; i++) {
    event.remove(hidden[i])
  }
})