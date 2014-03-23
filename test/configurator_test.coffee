{Configurator} = require '../src/configurator'
{JSONFormatter} = require '../src/formatters/json'
{Loader} = require '../src/loaders/loader'
{fixture} = require './shortcuts'


describe 'Configurator', ->
  beforeEach ->
    @fixtureString = fixture 'json'
    @fixture = JSON.parse @fixtureString

    @configurator = new Configurator @fixture

  describe '#get', ->
    it 'provides an error when the provided key does not exist', (done) ->
      callback = sinon.spy (err, data) ->
        expect(err).to.be.instanceof Error
        done()

      @configurator.get 'imaginaryKey', callback

    it 'provides the entire context if no key is provided', (done) ->
      callback = sinon.spy (err, data) =>
        expect(data).to.deep.equal @fixture
        done()

      @configurator.get callback

    it 'provides data associated with the provided key', (done) ->
      callback = sinon.spy (err, data) ->
        expect(data).to.equal 'monokrome'
        done()

      @configurator.get 'user', callback

  describe '#set', ->
    beforeEach ->
      @fixture =
        example: 'data'

    it 'updates the context with the provided value', (done) ->
      @configurator.set @fixture
      @configurator.get (err, result) =>
        expect(result).to.deep.equal @fixture
        done()

    it 'updates a key in the context with the provided value', (done) ->
      @configurator.set 'fake.key.here', @fixture
      @configurator.get 'fake.key.here', (err, result) =>
        expect(result).to.deep.equal @fixture
        done()

  describe '#load', ->
