{Formatter} = require './formatter'

ini = require 'ini'


class INIFormatter extends Formatter
  fromString: (asString, callback) ->
    callback null, ini.decode asString

  toString: (asObject, callback) ->
    callback null, ini.encode asObject


module.exports = {INIFormatter}
