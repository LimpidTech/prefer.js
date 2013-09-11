{JSONFormatter} = require '../src/formatters/json'
{YAMLFormatter} = require '../src/formatters/yaml'
{INIFormatter} = require '../src/formatters/ini'
{CoffeeFormatter} = require '../src/formatters/coffee'

chai = require 'chai'
sinon = require 'sinon'
shortcuts = require './shortcuts'


fixture = user: 'monokrome', domains: ['monokro.me', 'audalysis.com']



describe 'JSONFormat', ->
  asString = shortcuts.fixture 'json'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new JSONFormatter

      callback = (err, data) ->
        chai.expect(err).to.equal null
        chai.expect(data).to.deep.equal fixture

        done()

      result = formatter.parse asString, callback

  describe '#stringify', ->
    it 'converts the provided object into a JSON string', (done) ->
      formatter = new JSONFormatter

      callback = (err, data) ->
        chai.expect(err).to.equal null
        chai.expect(shortcuts.noTrainingLine data).to.equal asString

        done()

      result = formatter.stringify fixture, callback


describe 'YAMLFormat', ->
  asString = shortcuts.fixture 'yml'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new YAMLFormatter

      callback = (err, data) ->
        chai.expect(err).to.equal null
        chai.expect(data).to.deep.equal fixture
        done()

      result = formatter.parse asString, callback

  describe '#stringify', ->
    it 'converts the provided object into a YAML string', (done) ->
      formatter = new YAMLFormatter

      callback = (err, data) ->
        chai.expect(err).to.equal null
        chai.expect(shortcuts.noTrainingLine data).to.equal asString
        done()

      result = formatter.stringify fixture, callback


describe 'INIFormat', ->
  asString = shortcuts.fixture 'ini'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new INIFormatter

      callback = (err, data) ->
        chai.expect(err).to.equal null
        chai.expect(data).to.deep.equal fixture
        done()

      result = formatter.parse asString, callback

  describe '#stringify', ->
    it 'converts the provided object into a INI string', (done) ->
      formatter = new INIFormatter

      callback = (err, data) ->
        chai.expect(err).to.equal null
        chai.expect(shortcuts.noTrainingLine data).to.equal asString
        done()

      result = formatter.stringify fixture, callback


describe 'CoffeeFormat', ->
  asString = shortcuts.fixture 'coffee'

  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new CoffeeFormatter

      callback = (err, data) ->
        chai.expect(err).to.equal null
        chai.expect(data).to.deep.equal fixture
        done()

      result = formatter.parse asString, callback

  describe '#stringify', ->
    it 'throws an error since coffee can not be serialized', (done) ->
      formatter = new CoffeeFormatter

      callback = (err, data) ->
        chai.expect(err).to.be.instanceof Error
        done()

      result = formatter.stringify fixture, callback
