{Configurator} = require '../src/configurator'
{FileLoader} = require '../src/loaders/file_loader'
{JSONFormatter} = require '../src/formatters/json'


prefer = require '../src/index'
sinon = require 'sinon'
chai = require 'chai'
lodash = require 'lodash'


describe 'prefer', ->
  options =
    files:
      searchPaths: ['test/fixtures/']

  describe '#load', ->
    it 'provides an error when no matching formatter exists', (done) ->
      callback = sinon.spy (err, configurator) ->
        chai.expect(callback.calledOnce).to.be.true
        chai.expect(err).to.be.instanceof Error

        done()

      prefer.load 'fixture.fake', options, callback

    it 'provides an error when data is malformed', (done) ->
      callback = sinon.spy (err, configurator) ->
        chai.expect(callback.calledOnce).to.be.true
        chai.expect(err).to.be.instanceof Error

        done()

      prefer.load 'fixture_malformed.coffee', options, callback

    it 'provides an error when no loader could be found', (done) ->
      callback = sinon.spy (err, configurator) ->
        chai.expect(callback.calledOnce).to.be.true
        chai.expect(err).to.be.instanceof Error

        done()

      prefer.load '/\////// THIS LOCATION IS IMPOSSIBLE ///////\/', options, callback

    it 'provides a configurator when successfully loading a file', (done) ->
      callback = sinon.spy (err, configurator) ->
        chai.expect(callback.calledOnce).to.be.true

        chai.expect(err).to.equal null
        chai.expect(configurator).to.be.instanceof Configurator

        done()

      prefer.load 'fixture.json', options, callback

    it 'allows options to be an optional argument', (done) ->
      callback = sinon.spy (err, configurator) ->
        chai.expect(callback.calledOnce).to.be.true
        done()

      prefer.load 'fixture.json', callback

    it 'uses the given loader instance if one is provided', (done) ->
      localOptions = lodash.merge {}, options,
        loader: new FileLoader

      localOptions.loader.load = sinon.spy localOptions.loader.load

      prefer.load 'fixture.json', localOptions, (err, data) ->
        chai.expect(localOptions.loader.load.calledOnce).to.be.true
        done()

    it 'uses the given formatter instance if one is provided', (done) ->
      formatter = new JSONFormatter
      localOptions = lodash.merge {}, options, {formatter}

      formatter.parse = sinon.spy formatter.parse

      prefer.load 'fixture.json', localOptions, (err, data) ->
        chai.expect(formatter.parse.calledOnce).to.be.true
        done()

    it 'passes an error to the callback when loader.load fails', (done) ->
      fakeError = new Error 'Injected error for testing load error'

      class FakeLoader
        load: (filename, callback) ->
          callback fakeError

      localOptions = lodash.extend {}, options,
        loader: FakeLoader

      prefer.load 'fixture.json', localOptions, (err, data) ->
        chai.expect(err).to.equal fakeError
        done()
