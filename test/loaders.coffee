path = require 'path'
fixturesPath = 'test/fixtures/'


module.exports =
  create: (Type) ->
    new Type
      files:
        searchPaths: [fixturesPath]
