// priority: 5
// Create Gunsmithing integration — issue #11
//
// Wires CGS into ore wash chemistry, petrochem coke, and electronics gates.
// Personal weapons + brass SA ammo; complements CBC artillery in explosives.js.

ServerEvents.tags('item', event => {
  event.add('kubejs:propellants', ['kubejs:factory_propellant'])
  event.add('c:gunpowders', ['kubejs:factory_propellant'])
})

ServerEvents.recipes(event => {
  // --- Remove parallel steel / ore bypasses ---------------------------------

  event.remove({ id: 'cgs:mixing/steel_ingot' })
  event.remove({ id: 'cgs:pressing/steel_ingot' })
  event.remove({ id: 'cgs:steel_ingot' })
  event.remove({ id: 'cgs:steel_ingot_from_steel_nugget' })
  event.remove({ id: 'cgs:steel_block_from_steel_ingot' })
  event.remove({ id: 'cgs:steel_nugget' })

  event.remove({ id: 'cgs:lead_ingot' })
  event.remove({ id: 'cgs:lead_ingot_from_lead_nugget' })
  event.remove({ id: 'cgs:lead_block_from_lead_ingot' })
  event.remove({ id: 'cgs:lead_nugget' })
  event.remove({ id: 'cgs:raw_lead' })
  event.remove({ id: 'cgs:raw_lead_block_from_raw_lead' })

  event.remove({ id: 'cgs:mixing/niter_guano' })
  event.remove({ id: 'cgs:mixing/niter_rot' })

  // --- Factory propellant (sulfur + nitrate + coke required) ------------------

  event.recipes.create.mixing(Item.of('kubejs:factory_propellant', 4), [
    '2x tfmg:sulfur_dust',
    '2x tfmg:nitrate_dust',
    'tfmg:coal_coke_dust',
    Fluid.of('minecraft:water', 250)
  ])
    .heated()
    .id('kubejs:gunsmithing/mixing/factory_propellant')

  // Brass SA blanks and automated cartridges use factory propellant, not
  // washed zinc gunpowder alone.
  event.replaceInput({ mod: 'cgs', input: '#c:gunpowders' }, '#c:gunpowders', 'kubejs:factory_propellant')

  // Flintlock-tier shapeless ammo still accepts chemistry gunpowder.
  event.replaceInput({ id: 'cgs:paper_cartridge' }, 'kubejs:factory_propellant', '#c:gunpowders')
  event.replaceInput({ id: 'cgs:paper_shot' }, 'kubejs:factory_propellant', '#c:gunpowders')
  event.replaceInput({ id: 'cgs:sequenced_assembly/paper_cartridge' }, 'kubejs:factory_propellant', '#c:gunpowders')
  event.replaceInput({ id: 'cgs:sequenced_assembly/paper_shot' }, 'kubejs:factory_propellant', '#c:gunpowders')

  event.replaceInput({ mod: 'cgs', input: 'cgs:charcoal_dust' }, 'cgs:charcoal_dust', 'tfmg:coal_coke_dust')

  // --- Tier 2 weapon gates (mechanical crafting) ----------------------------

  event.replaceInput({ id: 'cgs:mechanical_crafting/revolver' }, '#c:ingots/steel', 'tfmg:steel_mechanism')
  event.replaceInput({ id: 'cgs:mechanical_crafting/shotgun' }, 'create:andesite_alloy', 'create:precision_mechanism')
  event.replaceInput({ id: 'cgs:mechanical_crafting/nailgun' }, 'create:precision_mechanism', 'kubejs:control_unit')
  event.replaceInput({ id: 'cgs:mechanical_crafting/gatling' }, 'create:precision_mechanism', 'tfmg:steel_mechanism')
  event.replaceInput({ id: 'cgs:mechanical_crafting/launcher' }, 'create:fluid_pipe', 'tfmg:plastic_sheet')
  event.replaceInput({ id: 'cgs:mechanical_crafting/gatling_drum' }, 'create:andesite_alloy', 'kubejs:control_unit')
  event.replaceInput({ id: 'cgs:mechanical_crafting/gatling_drum' }, 'create:large_cogwheel', 'tfmg:copper_spool')

  // --- Tier 3 advanced ammunition -------------------------------------------

  event.replaceInput(
    { id: 'cgs:sequenced_assembly/revolver_round_piercing' },
    '#c:nuggets/steel',
    'create_new_age:overcharged_iron'
  )

  event.replaceInput(
    { id: 'cgs:sequenced_assembly/shotgun_round_incendiary' },
    'minecraft:blaze_powder',
    'tfmg:gasoline_bucket'
  )

  event.replaceInput(
    { id: 'cgs:sequenced_assembly/shotgun_round_flechette_steel' },
    'cgs:nail_steel',
    'tfmg:heavy_plate'
  )

  event.replaceInput({ id: 'cgs:sequenced_assembly/rocket' }, 'minecraft:tnt', 'kubejs:factory_propellant')
  event.replaceInput({ id: 'cgs:sequenced_assembly/rocket_small' }, 'minecraft:tnt', 'kubejs:factory_propellant')
  event.replaceInput({ id: 'cgs:sequenced_assembly/rocket' }, '#c:plates/brass', 'tfmg:plastic_sheet')
  event.replaceInput({ id: 'cgs:sequenced_assembly/rocket_small' }, '#c:plates/brass', 'tfmg:plastic_sheet')

  event.replaceInput({ id: 'cgs:frag_grenade' }, 'minecraft:gunpowder', 'kubejs:factory_propellant')
})