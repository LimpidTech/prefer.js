{Configurator} = require '../configurators/simple'
{FileLoader} = require './file_loader'

ini = require 'ini'


class INILoader extends FileLoader
  configurator: Configurator

  parse: (data, callback) ->
    callback null, ini.decode data


module.exports = {INILoader}

