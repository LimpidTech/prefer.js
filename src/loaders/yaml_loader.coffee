{Configurator} = require '../configurators/simple'
{FileLoader} = require './file_loader'

yaml = require 'js-yaml'


class YAMLLoader extends FileLoader
  configurator: Configurator

  parse: (data, callback) ->
    callback null, yaml.load data


module.exports = {YAMLLoader}

