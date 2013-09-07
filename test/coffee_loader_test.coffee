loaders = require './loaders'


describe 'CoffeeLoader', ->
  describe '#load', ->
    it 'should pass a parsed object back to the callback', loaders.test 'coffee'
