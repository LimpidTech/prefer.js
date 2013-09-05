FileLoader = (require './file_loader').Loader
fs = require 'fs'


class YAMLLoader extends FileLoader
  parse: (data, callback) ->
    callback null, yaml.eval data


module.exports.Loader = YAMLLoader

