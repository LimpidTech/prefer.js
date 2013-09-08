loaders = require './loaders'
chai = require 'chai'


describe 'JSONLoader', ->
  describe '#load', ->
    it 'provides a native object to the callback', loaders.test 'JSON'


describe 'YAMLLoader', ->
  describe '#load', ->
    it 'provides a native object to the callback', loaders.test 'YAML', '.yml'


describe 'INILoader', ->
  describe '#load', ->
    it 'provides a native object to the callback', loaders.test 'INI'


describe 'XMLLoader', ->
  describe '#load', ->
    it 'provides a native object to the callback', loaders.test 'XML'

describe 'CoffeeLoader', ->
  success_test = loaders.test 'Coffee'

  broken_test = loaders.test 'Coffee', '_broken.coffee', (done) ->
    return (err, data) ->
      chai.expect(err).to.be.instanceof Error
      done()

  describe '#load', ->
    it 'provides a native object to the callback', success_test
    it 'passes an error to callback if errors occur', broken_test
