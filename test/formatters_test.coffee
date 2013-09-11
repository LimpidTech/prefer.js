{JSONFormatter} = require '../src/formatters/json'

fs = require 'fs'
chai = require 'chai'
sinon = require 'sinon'


fixture = user: 'monokrome', domains: ['monokro.me', 'audalysis.com']


describe 'JSONFormat', ->
  normalizePattern = new RegExp '[\\n\\s]+', 'g'

  asString = fs.readFileSync('test/fixtures/fixture.json')
               .toString()
               .replace normalizePattern, ''


  describe '#parse', ->
    it 'converts the provided string to an object', (done) ->
      formatter = new JSONFormatter

      callback = (err, data) ->
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
