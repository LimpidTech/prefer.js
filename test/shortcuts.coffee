fs = require 'fs'


module.exports =
  fixture: (ext) -> fs.readFileSync('test/fixtures/fixture.' + ext).toString()
