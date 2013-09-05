FileLoader = (require './file_loader').Loader


class JSONLoader extends FileLoader
  parse: (data, callback) ->
    callback null, JSON.parse data


module.exports.Loader = JSONLoader

