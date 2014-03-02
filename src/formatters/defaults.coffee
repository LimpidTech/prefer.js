path = require 'path'
_ = require 'lodash'


matches = (type) ->
  type = '.' + type if type[0] isnt '.'
  return (potential) ->
    return type is path.extname potential.source


module.exports = [
    match: matches 'json'
    module: './formatters/json:JSONFormatter'
  ,

    match: matches 'yml'
    module: './formatters/yaml:YAMLFormatter'
  ,

    match: matches 'xml'
    module: './formatters/xml:XMLFormatter'
  ,

    match: matches 'coffee'
    module: './formatters/coffee:CoffeeFormatter'
  ,

    match: matches 'ini'
    module: './formatters/ini:INIFormatter'
]
