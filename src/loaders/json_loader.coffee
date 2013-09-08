{Configurator} = require '../configurators/simple'
{FileLoader} = require './file_loader'


class JSONLoader extends FileLoader
  configurator: Configurator

  parse: (data, callback) ->
    callback null, JSON.parse data


module.exports = {JSONLoader}

