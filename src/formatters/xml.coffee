Q = require 'q'
xml2js = require 'xml2js'

{Formatter} = require './formatter'
{proxyPromise} = require '../util'


options =
  explicitArray: false
  explicitRoot: false
  async: true
  trim: true

parser = new xml2js.Parser options


class XMLFormatter extends Formatter
  fromString: (asString, deferred) ->
    proxyPromise deferred, Q.nfcall parser.parseString, asString

module.exports = {XMLFormatter}
