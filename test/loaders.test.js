{Loader} = require '../src/loaders/loader'
{FileLoader} = require '../src/loaders/file_loader'

lodash = require 'lodash'
path = require 'path'
fs = require 'fs'


class FakeError


loaders =
  fixture: require './fixtures/fixture.coffee'

  callback: (done) ->
    callback = sinon.spy (err, data) ->
      expect(err).to.be.null

      expect(callback.calledOnce).to.be.true
      expect(data).to.deep.equal loaders.fixture

      done()

    return callback


describe 'Loader', ->
  beforeEach ->
    @loader = new Loader

  describe '#updated', ->
    it 'should emit "updated" without error', ->
      @loader.updated null

    it 'should emit "updateFailed" with an error', ->
      @loader.updated new Error 'Fake error'

  describe '#formatterRequired', ->
    it 'should default to true', (done) ->
      @loader.formatterRequired().then (result) ->
        expect(result).to.be.true
        done()

  describe '#formatterSuggested', ->
    it "should not suggest formatters by default", (done) ->
      search = @loader.formatterSuggested()
      search.then (result) ->
        expect(result).to.be.false
        done()


describe 'FileLoader', ->
  beforeEach ->
    @fixturesPath = path.resolve 'test/fixtures'

    @identifierBase = 'fixture'
    @identifier = @identifierBase + '.json'

    @loader = new FileLoader
      files:
        watch: no
        searchPaths: ['test/fixtures/']

  describe '#load', ->
    it 'results in a not found error if no file was found', ->
      expect -> @loader.load 'fakeFile'
        .to.throw.error

    it 'throws an error if reading the requested file fails', (done) ->
      sandbox = sinon.sandbox.create()

      sandbox.stub fs, 'readFile', (filename, encoding, callback) ->
        callback new FakeError 'Fake error for testing failure reading files.'

      callback = sinon.spy (err, data) ->
        expect(err).to.be.instanceof FakeError

        sandbox.restore()
        done()

      @loader.load 'fixture.json', callback

  describe '#formatterRequired', ->
    it 'should always result as true', (done) ->
      @loader.formatterRequired().then (result) ->
        expect(result).to.be.true
        done()

  describe '#formatterSuggested', ->
    it "should suggest a formatter using it's file extension", (done) ->
      search = @loader.formatterSuggested
        identifier: @identifier

      search.then (result) ->
        expect(result).to.equal 'json'
        done()

    it 'should find all possible configurations when no extension is provided', (done) ->
      search = @loader.formatterSuggested
        identifier: @identifierBase

      allFixtures = fs.readdir @fixturesPath, (err, fileNames) =>
        absoluteFileNames = lodash.map fileNames, (fileName) =>
          path.join @fixturesPath, fileName

        search.then (result) ->
          expect(absoluteFileNames).to.deep.equal result
          done()

  describe '#changed', ->
    it 'emits the provided event', (done) ->
      callback = (err, results) =>
        @loader.on 'changed', (filename) ->
          expect(filename).to.equal results.source
          done()

        changed = @loader.getChangeHandler results.source
        changed 'changed'

      @loader.load 'fixture.json', callback

  describe '#watch', ->
    beforeEach -> sinon.stub fs, 'watch'
    afterEach -> fs.watch.restore()

    beforeEach ->
      @loader = new FileLoader
        files:
          watch: yes
          searchPaths: ['test/fixtures/']

    it 'calls the handler returned from #changed when files change', (done) ->
      changedHandler = sinon.stub()

      changed = sinon.stub @loader, 'getChangeHandler'
      changed.returns changedHandler

      callback = (err, results) ->
        expect(fs.watch.calledOnce).to.be.true

        hasExpectedArgs = fs.watch.calledWith results.source,
          persistent: false
        , changedHandler

        expect(hasExpectedArgs).to.be.true

        changed.restore()
        done()

      @loader.load 'fixture.json', callback

    it 'calls #updated when new configuration is ready', (done) ->
      callback = sinon.spy (err, results) =>
        @loader.updated = sinon.stub @loader, 'updated', (err, results) =>
          expect(@loader.updated.calledOnce).to.be.true

          expect(err).to.equal null
          expect(results).to.deep.equal results

          @loader.updated.restore()

          done()

        expect(@loader.updated.notCalled).to.be.true

        # fs.watch will call this in the real world
        changed = @loader.getChangeHandler results.source
        changed 'changed'

      @loader.load 'fixture.json', callback
