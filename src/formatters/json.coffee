{Formatter} = require './formatter'


class JSONFormatter extends Formatter
  fromString: (asString, deferred) -> deferred.resolve JSON.parse asString
  toString: (asObject, deferred) -> deferred.resolve JSON.stringify asObject


module.exports = {JSONFormatter}
