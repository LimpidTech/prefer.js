{Formatter} = require './formatter'

CSON = require 'cson'


class CSONFormatter extends Formatter
  fromString: (asString, callback) ->
    CSON.parse asString, callback

  toString: (asObject, callback) ->
    CSON.stringify asObject, callback


module.exports = {CSONFormatter}

