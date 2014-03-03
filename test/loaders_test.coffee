{FileLoader} = require '../src/loaders/file_loader'

sinon = require 'sinon'
path = require 'path'
chai = require 'chai'
fs = require 'fs'


class FakeError


loaders =
  fixture: require './fixtures/fixture.coffee'

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
      fixtureName = 'fixture' + loaderExtension

      loader.load fixtureName, callback done


describe 'FileLoader', ->
  describe '#load', ->
    it 'results in a not found error if no file was found', (done) ->
      callback = sinon.spy (err, data) ->
        chai.expect(err).to.be.instanceof Error
        chai.expect(callback.calledOnce).to.be.true

        done()

      loader = loaders.create FileLoader
      loader.load 'fakeFile', callback

    it 'throws an error if reading the requested file fails', (done) ->
      sandbox = sinon.sandbox.create()

      sandbox.stub fs, 'readFile', (filename, encoding, callback) ->
        callback new FakeError 'Fake error for testing failure reading files.'

      loader = loaders.create FileLoader

      callback = sinon.spy (err, data) ->
        chai.expect(err).to.be.instanceof FakeError

        sandbox.restore()
        done()

      loader.load 'fixture.json', callback
