// In-game hints for non-obvious TFMG machines (optional quest companion text).

ItemEvents.modifyTooltips(event => {
  event.add('tfmg:casting_basin', [
    Text.of('Fill with ').append(Text.of('250 mB+ Liquid Asphalt').color(0x55AAFF)),
    Text.of('(bucket or fluid pipe from a tank).'),
    Text.of('Place a ').append(Text.of('hopper under').color(0xFFAA00)).append(Text.of(' the basin to collect Asphalt blocks.')),
    Text.of('Not Create\u2019s basin — this is the TFMG Casting Basin.')
  ])

  event.add('tfmg:liquid_asphalt_bucket', [
    Text.of('Made in a ').append(Text.of('heated').color(0xFF5555)).append(Text.of(' Create Mixer:')),
    Text.of('Asphalt Mixture + Water \u2192 Liquid Asphalt.'),
    Text.of('Pour into a ').append(Text.of('TFMG Casting Basin').color(0xFFAA00)).append(Text.of(' (250 mB per block).'))
  ])

  event.add('tfmg:asphalt_mixture', [
    Text.of('Mixer: Sand + Gravel + Bitumen (from heated compacting of Heavy Oil).')
  ])
})