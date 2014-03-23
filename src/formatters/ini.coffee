{Formatter} = require './formatter'

ini = require 'ini'


class INIFormatter extends Formatter
  fromString: (asString, deferred) -> deferred.resolve ini.decode asString
  toString: (asObject, deferred) -> deferred.resolve ini.encode asObject


module.exports = {INIFormatter}
