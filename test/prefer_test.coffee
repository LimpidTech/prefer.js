{Configurator} = require '../src/configurators/base'


prefer = require '../src/index'
sinon = require 'sinon'
chai = require 'chai'
_ = require 'lodash'


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

    it 'uses the given loader instance if one is provided', (done) ->
      hook = sinon.spy()

      class FakeLoader
        configurator: sinon.mock()

        load: (filename, callback) ->
          hook()
          callback null, {}

      localOptions = _.extend {}, options,
        loader: FakeLoader

      prefer.load 'loader_test.json', localOptions, (err, data) ->
        chai.expect(hook.calledOnce).to.be.true
        done()
