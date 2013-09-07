loaders = require './loaders'


chai = require 'chai'


describe 'JSONLoader', ->
  describe '#load', ->
    it 'should pass a parsed object back to the callback', loaders.test 'json'
