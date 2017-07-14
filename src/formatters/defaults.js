path = require 'path'
lodash = require 'lodash'


ensureDot = (val) -> '.' + val if val[0] isnt '.'


provides = (type) ->
  type = ensureDot type

  return (potentials) -> lodash.map potentials, (potential) ->
    return yes if type is ensureDot potential
    return type is path.extname potential


module.exports = [
    provides: provides 'json'
    module: './formatters/json:JSONFormatter'
  ,

    provides: provides 'yml'
    module: './formatters/yaml:YAMLFormatter'
  ,

    provides: provides 'xml'
    module: './formatters/xml:XMLFormatter'
  ,

    provides: provides 'coffee'
    module: './formatters/coffee:CoffeeFormatter'
  ,

    provides: provides 'ini'
    module: './formatters/ini:INIFormatter'
]
