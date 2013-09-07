loaders = require './loaders'


describe 'YAMLLoader', ->
  describe '#load', ->
    it 'should pass a parsed object back to the callback', loaders.test 'yaml', '.yml'
