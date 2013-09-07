loaders = require './loaders'
chai = require 'chai'


describe 'CoffeeLoader', ->
  success_test = loaders.test 'coffee'

  broken_test = loaders.test 'coffee', '_broken.coffee', (done) ->
    return (err, data) ->
      chai.expect(err).to.be.instanceof Error
      done()

  describe '#load', ->
    it 'should pass a parsed object back to the callback', success_test
    it 'should pass an error to callback if errors occur', broken_test
