loaders = require './loaders'


describe 'INILoader', ->
  describe '#load', ->
    it 'should pass a parsed object back to the callback', loaders.test 'ini'
