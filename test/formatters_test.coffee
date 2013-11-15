{JSONFormatter} = require '../src/formatters/json'
{YAMLFormatter} = require '../src/formatters/yaml'
{INIFormatter} = require '../src/formatters/ini'
{CoffeeFormatter} = require '../src/formatters/coffee'
{XMLFormatter} = require '../src/formatters/xml'
{expect} = require 'chai'

sinon = require 'sinon'
shortcuts = require './shortcuts'


fixture = user: 'monokrome', domains: ['monokro.me', 'audalysis.com']


describe 'JSONFormatter', ->
  asString = shortcuts.fixture 'json'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new JSONFormatter

      callback = (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture

        done()

      result = formatter.parse asString, callback

    it 'provides an error to the callback when necessary', ->
      error = new Error 'Mock error'

      formatter = new JSONFormatter
      sinon.stub formatter, 'fromString', -> throw error

      callback = (err) -> expect(err).to.equal error
      formatter.parse asString, callback

  describe '#stringify', ->
    it 'converts the provided object into a JSON string', (done) ->
      formatter = new JSONFormatter

      callback = (err, data) ->
        expect(err).to.equal null
        expect(shortcuts.noTrainingLine data).to.equal asString

        done()

      result = formatter.stringify fixture, callback


describe 'YAMLFormatter', ->
  asString = shortcuts.fixture 'yml'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new YAMLFormatter

      callback = (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

      result = formatter.parse asString, callback

  describe '#stringify', ->
    it 'converts the provided object into a YAML string', (done) ->
      formatter = new YAMLFormatter

      callback = (err, data) ->
        expect(err).to.equal null
        expect(shortcuts.noTrainingLine data).to.equal asString
        done()

      result = formatter.stringify fixture, callback


describe 'INIFormatter', ->
  asString = shortcuts.fixture 'ini'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new INIFormatter

      callback = (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

      result = formatter.parse asString, callback

  describe '#stringify', ->
    it 'converts the provided object into a INI string', (done) ->
      formatter = new INIFormatter

      callback = (err, data) ->
        expect(err).to.equal null
        expect(shortcuts.noTrainingLine data).to.equal asString
        done()

      result = formatter.stringify fixture, callback


describe 'CoffeeFormatter', ->
  asString = shortcuts.fixture 'coffee'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new CoffeeFormatter

      callback = (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

      result = formatter.parse asString, callback

  describe '#stringify', ->
    it 'throws an error since coffee can not be serialized', (done) ->
      formatter = new CoffeeFormatter

      callback = (err, data) ->
        expect(err).to.be.instanceof Error
        done()

      result = formatter.stringify fixture, callback


describe 'XMLFormatter', ->
  asString = shortcuts.fixture 'xml'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new XMLFormatter

      callback = (err, data) ->
        expect(err).to.equal null
        expect(data).to.deep.equal fixture
        done()

      result = formatter.parse asString, callback

  describe '#stringify', ->
    it 'throws an error since coffee can not be serialized', (done) ->
      formatter = new XMLFormatter

      callback = (err, data) ->
        expect(err).to.be.instanceof Error
        done()

      result = formatter.stringify fixture, callback
