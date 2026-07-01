// priority: 0
// Custom factory meals — issue #6 (requires game restart on first load).

StartupEvents.registry('item', event => {
  event.create('fortified_seasoning')
    .displayName('Fortified Seasoning')
    .texture('expandeddelight:item/chili_pepper')

  event.create('ore_worker_stew')
    .displayName('Ore Worker Stew')
    .food(food => {
      food.nutrition(10)
      food.saturation(0.8)
    })
    .texture('farmersdelight:item/beef_stew')

  event.create('hearty_broth')
    .displayName('Hearty Broth')
    .food(food => {
      food.nutrition(8)
      food.saturation(0.6)
    })
    .texture('farmersdelight:item/bone_broth')

  event.create('vein_scout_snack')
    .displayName('Vein Scout Snack')
    .food(food => {
      food.nutrition(6)
      food.saturation(0.5)
    })
    .texture('farmersdelight:item/melon_popsicle')

  event.create('aged_cheese_wheel')
    .displayName('Aged Cheese Wheel')
    .texture('farmersdelight_extended:item/fresh_cheese')

  event.create('aged_cheese_slice')
    .displayName('Aged Cheese Slice')
    .food(food => {
      food.nutrition(4)
      food.saturation(0.5)
    })
    .texture('farmersdelight_extended:item/fresh_cheese')

  event.create('luxury_chocolate_bar')
    .displayName('Luxury Chocolate Bar')
    .food(food => {
      food.nutrition(6)
      food.saturation(0.7)
    })
    .texture('farmersdelight_extended:item/chocolate_graham_cracker')

  event.create('incomplete_lunchbox')
    .displayName('Incomplete Factory Lunchbox')
    .texture('farmersdelight_extended:item/bread_slice')

  event.create('factory_lunchbox')
    .displayName('Factory Lunchbox')
    .food(food => {
      food.nutrition(12)
      food.saturation(0.9)
    })
    .texture('supplementaries:item/lunch_basket')
})