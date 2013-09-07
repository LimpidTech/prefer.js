{Configurator} = require '../configurators/simple'
FileLoader = (require './file_loader').Loader

xml2js = require 'xml2js'


class XMLLoader extends FileLoader
  configurator: Configurator
  parser: new xml2js.Parser
    explicitArray: false
    explicitRoot: false
    async: true
    trim: true

  parse: (data, callback) ->
    @parser.parseString data, callback


module.exports.Loader = XMLLoader
