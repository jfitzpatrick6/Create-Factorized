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
    'sophisticatedcore:xp_bucket',
    'moredelight:bread_slice',
    'moredelight:toast',
    'moredelight:wooden_knife',
    'moredelight:stone_knife',
    'create_new_age:blank_circuit',
    'create_new_age:copper_circuit'
  ]

  for (var i = 0; i < hidden.length; i++) {
    event.remove(hidden[i])
  }
})

RecipeViewerEvents.removeEntries('fluid', event => {
  var hiddenFluids = [
    'sophisticatedcore:xp_still',
    'sophisticatedcore:xp_flow'
  ]

  for (var j = 0; j < hiddenFluids.length; j++) {
    event.remove(hiddenFluids[j])
  }
})