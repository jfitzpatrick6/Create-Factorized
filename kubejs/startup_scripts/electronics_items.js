// priority: 0
// Custom electronics items — requires game restart on first load.

StartupEvents.registry('item', event => {
  event.create('incomplete_control_unit')
    .displayName('Incomplete Control Unit')
    .texture('tfmg:item/unfinished_circuit_board')

  event.create('control_unit')
    .displayName('Control Unit')
    .texture('tfmg:item/circuit_board')

  event.create('iron_energiser_billet')
    .displayName('Iron Energiser Billet')
    .texture('minecraft:item/iron_ingot')

  event.create('gold_energiser_billet')
    .displayName('Gold Energiser Billet')
    .texture('minecraft:item/gold_ingot')

  event.create('diamond_energiser_billet')
    .displayName('Diamond Energiser Billet')
    .texture('minecraft:item/diamond')
})