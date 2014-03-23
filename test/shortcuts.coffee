fs = require 'fs'


normalize = (asString) ->
  if asString[asString.length - 1] is '\n'
    asString = asString[..asString.length - 2]

  return asString

fixture = (ext) ->
  contents = fs.readFileSync 'test/fixtures/fixture.' + ext

  return module.exports.normalize contents.toString()


module.exports = {
  normalize
  fixture
}
