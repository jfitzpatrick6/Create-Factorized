// priority: 0
// Factory propellant — issue #11 (requires game restart on first load).

StartupEvents.registry('item', event => {
  event.create('factory_propellant')
    .displayName('Factory Propellant')
    .texture('minecraft:item/gunpowder')
})