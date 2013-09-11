{Formatter} = require './formatter'

xml2js = require 'xml2js'


options =
  explicitArray: false
  explicitRoot: false
  async: true
  trim: true

parser = new xml2js.Parser options


class XMLFormatter extends Formatter
  fromString: (asString, callback) ->
    parser.parseString asString, callback


module.exports = {XMLFormatter}
