yaml = require 'js-yaml'
{Formatter} = require './formatter'


class YAMLFormatter extends Formatter
  fromString: (asString, deferred) -> deferred.resolve yaml.load asString
  toString: (asObject, deferred) -> deferred.resolve yaml.dump asObject


module.exports = {YAMLFormatter}
