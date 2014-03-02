{Configurator} = require '../configurators/simple'
{FileLoader} = require './file_loader'

json = require 'json5'


class JSONLoader extends FileLoader
  configurator: Configurator

  parse: (data, callback) ->
    callback null, json.parse data


module.exports = {JSONLoader}
