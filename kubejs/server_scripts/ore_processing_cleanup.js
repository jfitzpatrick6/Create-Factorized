// priority: 0

ServerEvents.recipes(event => {
  var compatPatterns = [
    /^create:.*compat_mekanism.*/,
    /^create:.*compat_immersiveengineering.*/,
    /^create:.*compat_thermal.*/,
    /^create:crushing\/compat\/.*/,
    /^create:splashing\/mekanism\/.*/,
    /^create:splashing\/immersiveengineering\/.*/,
    /^create:splashing\/thermal\/.*/,
    /^create:splashing\/ic2\/.*/,
    /^create:splashing\/oreganized\/.*/,
    /^create:splashing\/galosphere\/.*/,
    /^create:splashing\/iceandfire\/.*/
  ]

  compatPatterns.forEach(function (pattern) {
    event.remove({ id: pattern })
  })

  var cgsLeadRecipes = [
    'cgs:lead_ingot_from_smelting_lead_ore',
    'cgs:lead_ingot_from_smelting_deepslate_lead_ore',
    'cgs:lead_ingot_from_smelting_raw_lead',
    'cgs:lead_ingot_from_blasting_lead_ore',
    'cgs:lead_ingot_from_blasting_deepslate_lead_ore',
    'cgs:lead_ingot_from_blasting_raw_lead'
  ]

  cgsLeadRecipes.forEach(function (id) {
    event.remove({ id: id })
  })
})
