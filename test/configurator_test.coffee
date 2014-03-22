{YAMLFormatter} = require '../src/formatters/yaml'
{Loader} = require '../src/loaders/loader'


{
  Configurator
  ConfigurationError
} = require '../src/configurator'


sinon = require 'sinon'
chai = require 'chai'


describe 'Configurator', ->
  fixture =
    user: 'monokrome'
    domains: [
      'monokro.me'
      'audalysis.com'
    ]

  beforeEach ->
    @loader = new Loader

    @configurator = new Configurator
      context: fixture
      loader: @loader
      formatter: YAMLFormatter

  it 'updates the configuration when loader emits "updated"', sinon.test ->
    @loader.updated null,
      source: @configurator.options.source
      content: 'fakeData: true'

    chai.expect(@configurator.options.context).to.deep.equal
      fakeData: true

  describe '#get', ->
    it 'provides an error when the provided key does not exist', (done) ->
      callback = sinon.spy (err, data) ->
        chai.expect(err).to.be.instanceof Error
        done()

      @configurator.get 'imaginaryKey', callback

    it 'returns the entire context if no key is provided', (done) ->
      callback = sinon.spy (err, data) ->
        chai.expect(data).to.deep.equal fixture
        done()

      @configurator.get callback

    it 'returns data associated with the provided key', (done) ->
      callback = sinon.spy (err, data) ->
        chai.expect(data).to.equal 'monokrome'
        done()

      @configurator.get 'user', callback

  describe '#set', ->
    beforeEach ->
      @fixture =
        example: 'data'

    it 'updates the context with the provided value', (done) ->
      @configurator.set @fixture
      @configurator.get (err, result) =>
        chai.expect(result).to.deep.equal @fixture
        done()

    it 'updates a key in the context with the provided value', (done) ->
      @configurator.set 'fake.key.here', @fixture
      @configurator.get 'fake.key.here', (err, result) =>
        chai.expect(result).to.deep.equal @fixture
        done()
