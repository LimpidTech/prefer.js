{JSONFormatter} = require '../src/formatters/json'
{CSONFormatter} = require '../src/formatters/cson'
{YAMLFormatter} = require '../src/formatters/yaml'
{INIFormatter} = require '../src/formatters/ini'
{CoffeeFormatter} = require '../src/formatters/coffee'
{XMLFormatter} = require '../src/formatters/xml'
{expect} = require 'chai'


sinon = require 'sinon'
shortcuts = require './shortcuts'

fixture =
  user: 'monokrome'
  domains: ['monokro.me', 'audalysis.com']


withNormalization = (promise) -> promise.then shortcuts.normalize


describe 'JSONFormatter', ->
  beforeEach ->
    @asString = shortcuts.fixture 'json'

  describe '#parse', ->
    it 'converts the provided string to an object', () ->
      formatter = new JSONFormatter

      expect formatter.parse @asString
        .to.eventually.deep.equal fixture

    it 'provides an error to the callback when necessary', test ->
      error = new Error 'Mock Error'
      formatter = new JSONFormatter

      @stub formatter, 'fromString'
        .callsFake -> throw error

      expect formatter.parse @asString
        .to.eventually.be.rejectedWith error

  describe '#stringify', ->
    it 'converts the provided object into a JSON string', ->
      formatter = new JSONFormatter

      expect withNormalization formatter.stringify fixture
        .to.eventually.equal shortcuts.normalize @asString


describe 'YAMLFormatter', ->
  beforeEach ->
    @asString = shortcuts.fixture 'yml'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new YAMLFormatter
      formatter.parse @asString, (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

  describe '#stringify', ->
    it 'converts the provided object into a YAML string', ->
      formatter = new YAMLFormatter

      expect withNormalization formatter.stringify fixture
        .to.eventually.equal shortcuts.normalize @asString


describe 'INIFormatter', ->
  beforeEach ->
    @asString = shortcuts.fixture 'ini'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new INIFormatter
      formatter.parse @asString, (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

  describe '#stringify', ->
    it 'converts the provided object into an INI string', () ->
      formatter = new INIFormatter
      expect withNormalization formatter.stringify fixture
        .to.eventually.equal shortcuts.normalize @asString


describe 'CoffeeFormatter', ->
  beforeEach ->
    @asString = shortcuts.fixture 'coffee'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new CoffeeFormatter
      formatter.parse @asString, (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

  describe '#stringify', ->
    it 'throws an error since coffee can not be serialized', (done) ->
      formatter = new CoffeeFormatter
      formatter.stringify fixture, (err, data) ->
        expect(err).to.be.instanceof Error
        done()


describe 'XMLFormatter', ->
  beforeEach ->
    @asString = shortcuts.fixture 'xml'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new XMLFormatter
      formatter.parse @asString, (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

  describe '#stringify', ->
    it 'throws an error since coffee can not be serialized', (done) ->
      formatter = new XMLFormatter
      formatter.stringify fixture, (err, data) ->
        expect(err).to.be.instanceof Error
        done()


describe 'CSONFormatter', ->
  beforeEach ->
    @asString = shortcuts.fixture 'cson'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new CSONFormatter
      formatter.parse @asString, (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

    it 'provides an error to the callback when necessary', test () ->
      error = new Error 'Mock Error'
      formatter = new CSONFormatter

      @stub formatter, 'fromString'
        .callsFake -> throw error

      expect formatter.parse @asString
        .to.eventually.be.rejectedWith error

  describe '#stringify', ->
    it 'converts the provided object into a CSON string', ->
      formatter = new CSONFormatter

      expect withNormalization formatter.stringify fixture
        .to.eventually.equal shortcuts.normalize @asString
