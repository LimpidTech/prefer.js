loaders = require './loaders'


describe 'XMLLoader', ->
  describe '#load', ->
    it 'should pass a parsed object back to the callback', loaders.test 'xml'
