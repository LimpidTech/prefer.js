{Configurator} = require '../src/configurators/base'


prefer = require '../src/index'
sinon = require 'sinon'
chai = require 'chai'


describe 'prefer', ->
  options =
    files:
      searchPaths: ['test/fixtures/']

  describe '#load', ->
    it 'throws an error when no configuration loader exists', (done) ->
      callback = sinon.spy (err, configurator) ->
        chai.expect(callback.calledOnce).to.be.true
        chai.expect(err).to.be.instanceof Error

        done()

      prefer.load 'this.isNotEvenReal', options, callback

    it 'provides a configurator when successfully loading a file', (done) ->
      callback = sinon.spy (err, configurator) ->
        chai.expect(callback.calledOnce).to.be.true

        chai.expect(err).to.equal null
        chai.expect(configurator).to.be.instanceof Configurator

        done()

      prefer.load 'loader_test.json', options, callback

    it 'allows options to be an optional argument', (done) ->
      callback = sinon.spy (err, configurator) ->
        chai.expect(callback.calledOnce).to.be.true
        done()

      prefer.load 'loader_test.json', callback
