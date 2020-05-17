fs = require 'fs'


normalize = (asString) -> asString.trim '\n'


fixture = (ext) ->
  contents = fs.readFileSync 'test/fixtures/fixture.' + ext
  return contents.toString()


module.exports = {
  normalize
  fixture
}
