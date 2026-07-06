// priority: -1000
// Create recipe helpers on global — KubeJS 7 registers create:* schemas that lack .heated()/.loops().
// Server scripts call CreateRecipes.*(event, ...) which builds recipes via event.custom().

global.CreateItem = {
  of: function (item, chance) {
    return { __create_chance_output: true, item: item, chance: chance }
  }
}

global.CreateRecipes = (function () {
  function isFluidStack(value) {
    if (value == null || typeof value !== 'object') return false
    if (typeof value.getFluid === 'function' || typeof value.getAmount === 'function') return true
    return value.fluid != null && value.amount != null
  }

  function fluidId(stack) {
    if (stack.fluid != null) return String(stack.fluid)
    if (stack.fluidId != null) return String(stack.fluidId)
    if (typeof stack.getFluid === 'function') return String(stack.getFluid())
    return String(stack.id)
  }

  function fluidAmount(stack) {
    if (stack.amount != null) return stack.amount
    if (typeof stack.getAmount === 'function') return stack.getAmount()
    return 1000
  }

  function asItemStack(value) {
    if (value == null) return Item.of('minecraft:air')
    if (typeof value === 'string') return Item.of(value)
    if (value.id != null) return value
    return Item.of(String(value))
  }

  function parseIngredient(input) {
    if (isFluidStack(input)) {
      return {
        type: 'neoforge:single',
        amount: fluidAmount(input),
        fluid: fluidId(input)
      }
    }

    if (typeof input === 'string') {
      if (input.charAt(0) === '#') return { tag: input.substring(1) }
      var stack = Item.of(input)
      return stack.count > 1
        ? { item: String(stack.id), count: stack.count }
        : { item: String(stack.id) }
    }

    if (input.id != null) {
      return input.count > 1
        ? { item: String(input.id), count: input.count }
        : { item: String(input.id) }
    }

    throw new Error('Unknown Create recipe ingredient: ' + input)
  }

  function parseIngredients(inputs) {
    if (inputs == null) return []
    var list = Array.isArray(inputs) ? inputs : [inputs]
    return list.map(parseIngredient)
  }

  function parseResult(output) {
    if (output != null && output.__create_chance_output) {
      var chanceStack = asItemStack(output.item)
      var chanceResult = { id: String(chanceStack.id), chance: output.chance }
      if (chanceStack.count > 1) chanceResult.count = chanceStack.count
      return chanceResult
    }

    if (isFluidStack(output)) {
      return { id: fluidId(output), amount: fluidAmount(output) }
    }

    var stack = asItemStack(output)
    var result = { id: String(stack.id) }
    if (stack.count > 1) result.count = stack.count
    return result
  }

  function parseResults(outputs) {
    var list = Array.isArray(outputs) ? outputs : [outputs]
    return list.map(parseResult)
  }

  function parseKeyEntry(value) {
    if (typeof value === 'string' && value.charAt(0) === '#') {
      return { tag: value.substring(1) }
    }
    return { item: String(asItemStack(value).id) }
  }

  function makeBuilder(event, json) {
    var builder = {
      json: json,
      heated: function () {
        json.heat_requirement = 'heated'
        return builder
      },
      superheated: function () {
        json.heat_requirement = 'superheated'
        return builder
      },
      processingTime: function (ticks) {
        json.processing_time = ticks
        return builder
      },
      id: function (recipeId) {
        return event.custom(json).id(recipeId)
      }
    }
    return builder
  }

  function makeStepBuilder(event, json) {
    var builder = makeBuilder(event, json)
    builder.__create_step = true
    return builder
  }

  return {
    mixing: function (event, output, inputs) {
      return makeBuilder(event, {
        type: 'create:mixing',
        ingredients: parseIngredients(inputs),
        results: [parseResult(output)]
      })
    },

    splashing: function (event, outputs, input) {
      return makeBuilder(event, {
        type: 'create:splashing',
        ingredients: [parseIngredient(input)],
        results: parseResults(outputs)
      })
    },

    crushing: function (event, outputs, input) {
      return makeBuilder(event, {
        type: 'create:crushing',
        ingredients: [parseIngredient(input)],
        results: parseResults(outputs)
      })
    },

    compacting: function (event, output, inputs) {
      return makeBuilder(event, {
        type: 'create:compacting',
        ingredients: parseIngredients(inputs),
        results: [parseResult(output)]
      })
    },

    filling: function (event, output, inputs) {
      return makeStepBuilder(event, {
        type: 'create:filling',
        ingredients: parseIngredients(inputs),
        results: [parseResult(output)]
      })
    },

    deploying: function (event, output, inputs) {
      return makeStepBuilder(event, {
        type: 'create:deploying',
        ingredients: parseIngredients(inputs),
        results: [parseResult(output)]
      })
    },

    pressing: function (event, output, input) {
      return makeStepBuilder(event, {
        type: 'create:pressing',
        ingredients: [parseIngredient(input)],
        results: [parseResult(output)]
      })
    },

    cutting: function (event, outputs, input) {
      return makeBuilder(event, {
        type: 'create:cutting',
        ingredients: [parseIngredient(input)],
        results: parseResults(outputs)
      })
    },

    sequenced_assembly: function (event, results, ingredient, sequence) {
      var json = {
        type: 'create:sequenced_assembly',
        ingredient: parseIngredient(ingredient),
        sequence: sequence.map(function (step) {
          if (step == null || !step.__create_step) {
            throw new Error('Sequenced assembly steps must use CreateRecipes.* helpers')
          }
          return step.json
        }),
        results: parseResults(results)
      }

      var builder = {
        json: json,
        loops: function (count) {
          json.loops = count
          return builder
        },
        transitionalItem: function (item) {
          json.transitional_item = { id: String(asItemStack(item).id) }
          return builder
        },
        id: function (recipeId) {
          return event.custom(json).id(recipeId)
        }
      }
      return builder
    },

    mechanical_crafting: function (event, output, pattern, keys) {
      var keyJson = {}
      for (var letter in keys) {
        if (Object.prototype.hasOwnProperty.call(keys, letter)) {
          keyJson[letter] = parseKeyEntry(keys[letter])
        }
      }

      return makeBuilder(event, {
        type: 'create:mechanical_crafting',
        accept_mirrored: false,
        category: 'misc',
        pattern: pattern,
        key: keyJson,
        result: parseResult(output),
        show_notification: false
      })
    }
  }
})()