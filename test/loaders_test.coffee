{FileLoader} = require '../src/loaders/file_loader'

sinon = require 'sinon'
path = require 'path'
chai = require 'chai'
fs = require 'fs'


class FakeError


loaders =
  fixture: require './fixtures/loader_test.coffee'

  callback: (done) ->
    callback = sinon.spy (err, data) ->
      chai.expect(err).to.be.null

      chai.expect(callback.calledOnce).to.be.true
      chai.expect(data).to.deep.equal loaders.fixture

      done()

    return callback

  create: (Type) ->
    new Type
      files:
        searchPaths: ['test/fixtures/']


  test: (loaderType, loaderExtension, callback) ->
    unless loaderExtension?
      loaderExtension = '.' + loaderType.toLowerCase()

    module = require "../src/loaders/#{ loaderType.toLowerCase() }_loader"
    Loader = module[loaderType + 'Loader']

    callback ?= loaders.callback

    return (done) ->
      loader = loaders.create Loader
      fixtureName = 'loader_test' + loaderExtension

      loader.load fixtureName, callback done


module.exports = loaders
describe 'JSONLoader', ->
  describe '#load', ->
    it 'provides a native object to the callback', loaders.test 'JSON'


describe 'YAMLLoader', ->
  describe '#load', ->
    it 'provides a native object to the callback', loaders.test 'YAML', '.yml'


describe 'INILoader', ->
  describe '#load', ->
    it 'provides a native object to the callback', loaders.test 'INI'


describe 'XMLLoader', ->
  describe '#load', ->
    it 'provides a native object to the callback', loaders.test 'XML'


describe 'CoffeeLoader', ->
  success_test = loaders.test 'Coffee'

  broken_test = loaders.test 'Coffee', '_broken.coffee', (done) ->
    return (err, data) ->
      chai.expect(err).to.be.instanceof Error
      done()

  describe '#load', ->
    it 'provides a native object to the callback', success_test
    it 'passes an error to callback if errors occur', broken_test


describe 'FileLoader', ->
  describe '#load', ->
    it 'results in a not found error if no file was found', (done) ->
      callback = sinon.spy (err, data) ->
        chai.expect(err).to.be.instanceof Error
        chai.expect(callback.calledOnce).to.be.true

        done()

      loader = loaders.create FileLoader
      loader.load 'fakeFile', callback

    it 'calls parse if a file was found', sinon.spy (done) ->
      loader = loaders.create FileLoader

      callback = sinon.stub loader, 'parse', ->
        chai.expect(callback.calledOnce).to.be.true
        done()

      loader.load 'loader_test.json'

    it 'throws an error if parse is called without inheriting', (done) ->
      loader = loaders.create FileLoader

      callback = sinon.spy (err, data) ->
        chai.expect(callback.calledOnce).to.be.true
        chai.expect(err).to.be.instanceof Error

        done()

      loader.parse '', callback

    it 'throws an error if reading the requested file fails', (done) ->
      sandbox = sinon.sandbox.create()

      sandbox.stub fs, 'readFile', (filename, encoding, callback) ->
        callback new FakeError 'Fake error for testing failure reading files.'

      loader = loaders.create FileLoader

      callback = sinon.spy (err, data) ->
        chai.expect(err).to.be.instanceof FakeError

        sandbox.restore()
        done()

      loader.load 'loader_test.json', callback
