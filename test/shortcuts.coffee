fs = require 'fs'


module.exports =
  noTrainingLine: (asString) ->
    if asString[asString.length - 1] is '\n'
      asString = asString[..asString.length - 2]

    return asString

  fixture: (ext) ->
    contents = fs.readFileSync 'test/fixtures/fixture.' + ext

    return module.exports.noTrainingLine contents.toString()

