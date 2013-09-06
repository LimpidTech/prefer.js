FileLoader = (require './file_loader').Loader
yaml = require 'js-yaml'


class YAMLLoader extends FileLoader
  parse: (data, callback) ->
    callback null, yaml.load data


module.exports.Loader = YAMLLoader

