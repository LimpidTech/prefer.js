{Configurator} = require '../src/configurator'
{JSONFormatter} = require '../src/formatters/json'
{Loader} = require '../src/loaders/loader'
{fixture} = require './shortcuts'


describe 'Configurator', ->
  beforeEach ->
    @fixtureString = fixture 'json'
    @fixture = JSON.parse @fixtureString

    @state = {}

    @configurator = new Configurator @fixture, @state

  describe '#constructor', ->
    it 'sets #context to the provided context', ->
      expect(@configurator.context).to.equal @fixture

    it 'sets #state to the provided state', ->
      expect(@configurator.state).to.equal @state

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
      @initial = @fixture

      @fixture =
        example: 'data'

    it 'resolves an unchanged context without any key or value provided', (done) ->
      @configurator.set (err, context) =>
        expect(context).to.deep.equal @initial
        expect(@configurator.context).to.deep.equal @initial
        done()

    it 'updates the context with the provided value', (done) ->
      @configurator.set @fixture
      @configurator.get (err, context) =>
        expect(context).to.deep.equal @fixture
        done()

    it 'updates a key in the context with the provided value', (done) ->
      @configurator.set 'fake.key.here', @fixture
      @configurator.get 'fake.key.here', (err, context) =>
        expect(context).to.deep.equal @fixture
        done()
