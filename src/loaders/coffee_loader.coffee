{Configurator} = require '../configurators/simple'
FileLoader = (require './file_loader').Loader

require 'coffee-script'


class CoffeeLoader extends FileLoader
  configurator: Configurator

  get: (filename, callback) ->
    try
      data = require filename
      callback null, data

    catch error
      callback error


module.exports.Loader = CoffeeLoader

