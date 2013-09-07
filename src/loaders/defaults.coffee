path = require 'path'
_ = require 'lodash'


extensionMatches = (expectation) -> (pattern) ->
  unless _.isString pattern
    return false

  extension = path.extname pattern
  return extension is expectation


module.exports = [
    match: extensionMatches '.json'
    module: './loaders/json_loader'
  ,

    match: extensionMatches '.yml'
    module: './loaders/yaml_loader'
  ,

    match: extensionMatches '.xml'
    module: './loaders/xml_loader'
  ,

    match: extensionMatches '.coffee'
    module: './loaders/coffee_loader'
  ,

    match: extensionMatches '.ini'
    module: './loaders/ini_loader'
]
