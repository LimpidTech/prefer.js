{Configurator} = require '../src/configurators/simple'


sinon = require 'sinon'
chai = require 'chai'


describe 'SimpleConfigurator', ->
  fixture = require './fixtures/loader_test.coffee'

  beforeEach ->
    @configurator = new Configurator fixture

  describe '#get', ->
    it 'provides an error when the provided key does not exist', (done) ->
      callback = sinon.spy (err, data) ->
        chai.expect(err).to.be.instanceof Error
        done()

      @configurator.get 'imaginaryKey', callback

    it 'returns the entire context if no key is provided', (done) ->
      callback = sinon.spy (err, data) ->
        chai.expect(data).to.equal fixture
        done()

      @configurator.get callback


    it 'returns data associated with the provided key', (done) ->
      callback = sinon.spy (err, data) ->
        chai.expect(data).to.equal 'monokrome'
        done()

      @configurator.get 'user', callback
