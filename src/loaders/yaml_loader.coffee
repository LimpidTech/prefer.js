FileLoader = (require './file_loader').Loader
yaml = require 'yaml'


class YAMLLoader extends FileLoader
  parse: (data, callback) ->
    callback null, yaml.eval data


module.exports.Loader = YAMLLoader

