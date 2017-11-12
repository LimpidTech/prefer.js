import path from 'path'
import lodash from 'lodash'

function ensureDot(val) {
  if (val[0] !== '.') return `.${val}`
}

function provides(type) {
  type = ensureDot(type)
  return potentials =>
    lodash.map(potentials, potential => {
      if (type === ensureDot(potential)) return true
      else return type === path.extname(potential)
    })
}

module.exports = [
  {
    provides: provides('json'),
    module: './formatters/json',
  },

  {
    provides: provides('yml'),
    module: './formatters/yaml',
  },

  {
    provides: provides('xml'),
    module: './formatters/xml',
  },

  {
    provides: provides('coffee'),
    module: './formatters/coffee',
  },

  {
    provides: provides('ini'),
    module: './formatters/ini',
  },
]
