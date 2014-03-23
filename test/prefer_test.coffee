lodash = require 'lodash'
path = require 'path'
Q = require 'q'

prefer = require '../src'

{FileLoader} = require '../src/loaders/file_loader'
{JSONFormatter} = require '../src/formatters/json'
{fixture} = require './shortcuts'


describe 'prefer', ->
  beforeEach ->
    @identifier = 'fixture.json'

    @options =
      identifier: @identifier
      loaders: require '../src/loaders/defaults'
      formatters: require '../src/formatters/defaults'
      files:
        searchPaths: ['test/fixtures/']

    @fixtureString = fixture 'json'
    @fixture = JSON.parse @fixtureString

    @updates =
      source: path.resolve 'test/fixtures/' + @identifier
      content: @fixtureString

    @identifier = 'fixture.json'

    @formatter = prefer.getFormatter @options
    @loader = prefer.getLoader @options

    sinon.stub @formatter, 'parse', (content, callback) =>
      callback null, @fixture

  describe '#getFormatter', ->
    it 'throws an error when no formatter exists', ->
      action = =>
        formatter = prefer.getLoader
          identifier: @identifier
          formatters: []

      expect(action).to.throw()

    it 'returns the expected formatter', ->
      expect(@formatter).to.be.instanceof JSONFormatter

  describe '#getLoader', ->
    it 'throws an error when no loader exists', ->
      action = =>
        loader = prefer.getLoader
          identifier: @identifier
          loaders: []

      expect(action).to.throw()

    it 'returns the expected loader', ->
      expect(@loader).to.be.instanceof FileLoader

  describe '#format returns a function that', ->
    beforeEach ->
      @format = prefer.format @formatter
      @promise = @format @updates

    it 'wraps #formatter.parse', ->
      expect(@formatter.parse.calledOnce).to.be.true

    it 'returns a promise which provides a formatted context', (done) ->
      @promise.then (result) => result.get (err, context) =>
        expect(context).to.deep.equal @fixture
        done()
  
  describe '#load', ->
    it 'returns a promise that provides the configuration', (done) ->
      options = lodash.cloneDeep @options
      promise = prefer.load options

      promise.then (result) => result.get (err, context) =>
        expect(context).to.deep.equal @fixture
        done()

    it 'supports callback style usage', (done) ->
      options = lodash.cloneDeep @options
      promise = prefer.load options, (err, result) =>
        result.get (err, context) =>
          expect(context).to.deep.equal @fixture
          done()

    it 'allows identifier as a string', ->
      action = => prefer.load @identifier
      expect(action).not.to.throw()

    it 'throws an error without an identifier', ->
      action = => prefer.load()
      expect(action).to.throw()
