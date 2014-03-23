JSON5 = require 'json5'
{Formatter} = require './formatter'


class JSONFormatter extends Formatter
  fromString: (asString, deferred) -> deferred.resolve JSON5.parse asString
  toString: (asObject, deferred) -> deferred.resolve JSON5.stringify asObject


module.exports = {JSONFormatter}
