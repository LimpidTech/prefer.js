path = require 'path'
chai = require 'chai'
sinon = require 'sinon'
fixturesPath = 'test/fixtures/'

loaders =
  fixture:
    user: 'monokrome'
    website: 'http://monokro.me'

  callback: (done) ->
    callback = sinon.spy (err, data) ->
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(data).to.deep.equal loaders.fixture

      done()

    return callback

  create: (Type) ->
    new Type
      files:
        searchPaths: [fixturesPath]


  test: (loaderType) ->
    {Loader} = require '../src/loaders/json_loader'

    return (done) ->
      loader = loaders.create Loader
      loader.load loaderType + '_loader_test.json', loaders.callback done


module.exports = loaders
