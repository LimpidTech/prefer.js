path = require 'path'
chai = require 'chai'
sinon = require 'sinon'


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


  test: (loaderType, loaderExtension) ->
    unless loaderExtension?
      loaderExtension = '.' + loaderType

    {Loader} = require "../src/loaders/#{ loaderType }_loader"

    return (done) ->
      loader = loaders.create Loader
      fixtureName = 'loader_test' + loaderExtension

      loader.load fixtureName, loaders.callback done


module.exports = loaders
