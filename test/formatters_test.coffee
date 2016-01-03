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
  domains: [
    'monokro.me'
    'audalysis.com'
  ]


describe 'JSONFormatter', ->
  asString = shortcuts.fixture 'json'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new JSONFormatter
      formatter.parse asString, (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

    it 'provides an error to the callback when necessary', sinon.test (done) ->
      error = new Error 'Mock Error'
      formatter = new JSONFormatter

      @stub formatter, 'fromString', -> throw error

      formatter.parse asString, (err) ->
        expect(err).to.equal error
        done()

  describe '#stringify', ->
    it 'converts the provided object into a JSON string', (done) ->
      formatter = new JSONFormatter
      formatter.stringify fixture, (err, data) ->
        expect(err).to.equal null
        expect(shortcuts.normalize data).to.equal asString
        done()


describe 'YAMLFormatter', ->
  asString = shortcuts.fixture 'yml'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new YAMLFormatter
      formatter.parse asString, (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

  describe '#stringify', ->
    it 'converts the provided object into a YAML string', (done) ->
      formatter = new YAMLFormatter
      formatter.stringify fixture, (err, data) ->
        expect(err).to.equal null
        expect(shortcuts.normalize data).to.equal asString
        done()


describe 'INIFormatter', ->
  asString = shortcuts.fixture 'ini'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new INIFormatter
      formatter.parse asString, (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

  describe '#stringify', ->
    it 'converts the provided object into a INI string', (done) ->
      formatter = new INIFormatter
      formatter.stringify fixture, (err, data) ->
        expect(err).to.equal null
        expect shortcuts.normalize data
          .to.equal asString
        done()


describe 'CoffeeFormatter', ->
  asString = shortcuts.fixture 'coffee'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new CoffeeFormatter
      formatter.parse asString, (err, data) ->
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
  asString = shortcuts.fixture 'xml'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new XMLFormatter
      formatter.parse asString, (err, data) ->
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
  asString = shortcuts.fixture 'cson'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new CSONFormatter
      formatter.parse asString, (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

    it 'provides an error to the callback when necessary', sinon.test (done) ->
      error = new Error 'Mock Error'
      formatter = new CSONFormatter

      @stub formatter, 'fromString', -> throw error

      formatter.parse asString, (err) ->
        expect(err).to.equal error
        done()

  describe '#stringify', ->
    it 'converts the provided object into a CSON string', (done) ->
      formatter = new CSONFormatter

      formatter.stringify fixture, (err, data) ->
        expect(err).to.equal null
        expect shortcuts.normalize data
          .to.equal asString

        done()
