{JSONFormatter} = require '../src/formatters/json'
{YAMLFormatter} = require '../src/formatters/yaml'

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
        chai.expect(data).to.deep.equal asString
        done()

      result = formatter.stringify fixture, callback
