// In-game hints for non-obvious TFMG machines (optional quest companion text).

ItemEvents.modifyTooltips(event => {
  event.add('tfmg:casting_basin', [
    Text.of('TFMG block (fireproof bricks) — ').append(Text.of('not').color(0xFF5555)).append(Text.of(' Create\u2019s black Basin.')),
    Text.of('Fill to ').append(Text.of('144 mB').color(0x55AAFF)).append(Text.of(' Liquid Asphalt (basin max).')),
    Text.of('Hopper ').append(Text.of('under').color(0xFFAA00)).append(Text.of(' to collect asphalt blocks.'))
  ])

  event.add('create:basin', [
    Text.of('Asphalt: pipe in ').append(Text.of('144 mB').color(0x55AAFF)).append(Text.of(' Liquid Asphalt + ')),
    Text.of('heat below (blaze burner) \u2192 compacting recipe.')
  ])

  event.add('tfmg:liquid_asphalt_bucket', [
    Text.of('Heated Create Mixer: Asphalt Mixture + Water.'),
    Text.of('144 mB per asphalt block (Create Basin + heat, or TFMG Casting Basin + hopper).')
  ])

  event.add('tfmg:asphalt_mixture', [
    Text.of('Mixer: Sand + Gravel + Bitumen (from heated compacting of Heavy Oil).')
  ])
})