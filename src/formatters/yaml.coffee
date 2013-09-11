{Formatter} = require './formatter'

yaml = require 'js-yaml'


class YAMLFormatter extends Formatter
  fromString: (asString, callback) ->
    callback null, yaml.load asString

  toString: (asObject, callback) ->
    callback null, yaml.dump asObject


module.exports = {YAMLFormatter}
