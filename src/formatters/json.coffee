{Formatter} = require './formatter'


class JSONFormatter extends Formatter
  fromString: (asString, callback) ->
    callback null, JSON.parse asString

  toString: (asObject, callback) ->
    callback null, JSON.stringify asObject


module.exports = {JSONFormatter}
