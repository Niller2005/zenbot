/*
 * Zenbot 4 Genetic Backtester
 * Clifford Roche <clifford.roche@gmail.com>
 * 07/01/2017
 */

let PROPERTY_MUTATION_CHANCE = 0.30
let PROPERTY_CROSSOVER_CHANCE = 0.50

module.exports = {
  create: function(strategy) {
    var r = {}
    for (var k in strategy) {
      var v = strategy[k]
      if (v.type === 'int') {
        r[k] = Math.floor((Math.random() * (v.max - v.min + 1)) + v.min)
      } else if (v.type === 'int0') {
        r[k] = 0
        if (Math.random() >= 0.5) {
          r[k] = Math.floor((Math.random() * (v.max - v.min + 1)) + v.min)
        }
      } else if (v.type === 'intfactor') {
        // possible 0 value by providing min 0
        if (v.min == 0 && Math.random() <= 0.5) r[k] = 0
        else r[k] = Math.round((Math.random() * (v.max - v.min + 1)/v.factor)*v.factor)
      } else if (v.type === 'float') {
        r[k] = (Math.random() * (v.max - v.min)) + v.min
      } else if (v.type === 'period_length') {
        var s = Math.floor((Math.random() * (v.max - v.min + 1)) + v.min)
        r[k] = s + v.period_length
      } else if (v.type === 'listOption') {
        let index = Math.floor(Math.random() * v.options.length)
        r[k] = v.options[index]
      }

    }
    return r
  },

  range: function(v, step, stepSize) {
    var scale = step / (stepSize - 1)

    if (v.type === 'int') {
      return Math.floor((scale * (v.max - v.min)) + v.min)
    }
    else if (v.type === 'int0') {
      if (step == 0)
        return 0

      scale = (step-1) / (stepSize-2)
      return Math.floor((scale * (v.max - v.min)) + v.min)
    }
    else if (v.type === 'intfactor') {
      let val = Math.floor((scale * (v.max - v.min)) + v.min)
      return Math.floor(val / v.factor) * v.factor
    }
    else if (v.type === 'float') {
      return (scale * (v.max - v.min)) + v.min
    }
    else if (v.type === 'period_length') {
      var s = Math.floor((scale * (v.max - v.min)) + v.min)
      return s + v.period_length
    }
    else if (v.type === 'listOption') {
      scale = step / stepSize
      let index = Math.floor(scale * v.options.length)
      return v.options[index]
    }
  },

  mutation: function(oldPhenotype, strategy) {
    var r = module.exports.create(strategy)
    for (var k in oldPhenotype) {
      if (k === 'sim') continue

      var v = oldPhenotype[k]
      r[k] = (Math.random() < PROPERTY_MUTATION_CHANCE) ? r[k] : v
    }
    return r
  },

  crossover: function(phenotypeA, phenotypeB, strategy) {
    var p1 = {}
    var p2 = {}

    for (var k in strategy) {
      if (k === 'sim') continue

      p1[k] = Math.random() >= PROPERTY_CROSSOVER_CHANCE ? phenotypeA[k] : phenotypeB[k]
      p2[k] = Math.random() >= PROPERTY_CROSSOVER_CHANCE ? phenotypeA[k] : phenotypeB[k]
    }

    return [p1, p2]
  },

  fitness: function(phenotype) {
    if (typeof phenotype.sim === 'undefined') return 0

    var vsBuyHoldRate = (phenotype.sim.vsBuyHold / 50)
    var wlRatio = phenotype.sim.wins / phenotype.sim.losses
    if(isNaN(wlRatio)) { // zero trades will result in 0/0 which is NaN
      wlRatio = 1
    }
    var wlRatioRate = 1.0 / (1.0 + Math.pow(Math.E, -wlRatio))
    var rate = vsBuyHoldRate * (wlRatioRate)
    return rate
  },

  competition: function(phenotypeA, phenotypeB) {
    // TODO: Refer to geneticalgorithm documentation on how to improve this with diverstiy
    return module.exports.fitness(phenotypeA) >= module.exports.fitness(phenotypeB)
  },

  Range: function(min, max)  {
    var r = {
      type: 'int',
      min: min,
      max: max
    }
    return r
  },

  Range0: function(min, max)  {
    var r = {
      type: 'int0',
      min: min,
      max: max
    }
    return r
  },

  RangeFactor: function(min, max, factor)  {
    var r = {
      type: 'intfactor',
      min: min,
      max: max,
      factor: factor
    }
    return r
  },

  RangeFloat: function(min, max)  {
    var r = {
      type: 'float',
      min: min,
      max: max
    }
    return r
  },

  RangePeriod: function(min, max, period_length)  {
    var r = {
      type: 'period_length',
      min: min,
      max: max,
      period_length: period_length
    }
    return r
  },

  RangeMaType: function() {
    var r = {
      type: 'listOption',
      options: ['SMA', 'EMA', 'WMA', 'DEMA', 'TEMA', 'TRIMA', 'KAMA', 'MAMA', 'T3']
    }
    return r
  },

  ListOption: function(options) {
    var r ={
      type: 'listOption',
      options: options
    }
    return r
  }

}
