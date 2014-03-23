path = require 'path'
_ = require 'lodash'


provides = (type) ->
  type = '.' + type if type[0] isnt '.'

  return (potential) ->
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
