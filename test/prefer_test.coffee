{Configurator} = require '../src/configurators/base'


prefer = require '../src/index'
sinon = require 'sinon'
chai = require 'chai'


describe 'prefer', ->
  describe '#load', ->
    it 'provides a configurator when successfully loading a file', (done) ->
      options =
        files:
          searchPaths: ['test/fixtures/']

      callback = sinon.spy (err, configurator) ->
        chai.expect(callback.calledOnce).to.be.true

        chai.expect(err).to.equal null
        chai.expect(configurator).to.be.instanceof Configurator

        done()

      prefer.load 'loader_test.json', options, callback
