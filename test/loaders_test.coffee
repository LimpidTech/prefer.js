optimist = require 'optimist'

optimist.argv =
  '$0': './exmaple argument1 argument2'

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
    it 'should default to true', () ->
      @loader.formatterRequired()
        .then (result) -> expect(result).to.be.true

  describe '#formatterSuggested', ->
    it "should not suggest formatters by default", ->
      expect @loader.formatterSuggested()
        .to.eventually.equal no


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
      expect @loader.load 'fakeFile'
        .to.eventually.be.rejectedWith 'No files found matching: fakeFile'

    it 'throws an error if reading the requested file fails', test ->
      @stub fs, 'readFile'
        .callsFake (filename, encoding, callback) ->
          callback new FakeError 'Fake error for testing failure reading files.'

      expect @loader.load 'fixture.json'
        .to.eventually.be.rejectedWith()

  describe '#formatterRequired', ->
    it 'should always result as true', () ->
      @loader.formatterRequired().then (result) ->
        expect(result).to.be.true

  describe '#formatterSuggested', ->
    it "should suggest a formatter using it's file extension", () ->
      search = @loader.formatterSuggested
        identifier: @identifier

      search.then (result) ->
        expect(result).to.equal 'json'

    it 'should find all possible configurations when no extension is provided', () ->
      search = @loader.formatterSuggested
        identifier: @identifierBase

      allFixtures = fs.readdir @fixturesPath, (err, fileNames) =>
        absoluteFileNames = lodash.map fileNames, (fileName) =>
          path.join @fixturesPath, fileName

        search.then (result) ->
          expect(absoluteFileNames).to.deep.equal result

  describe '#changed', ->
    it 'emits the provided event', (done) ->
      @loader.load 'fixture.json', (err, results) =>
        @loader.on 'changed', (filename) ->
          expect(filename).to.equal results.source
          done()

        changed = @loader.getChangeHandler results.source
        changed 'changed'

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
      sinon.stub @loader, 'updated'

      @loader.load 'fixture.json'
        .then (results) =>
          expect(@loader.updated.notCalled).to.be.true

          # fs.watch will call this in the real world when files change
          changed = @loader.getChangeHandler results.source

          changed 'changed'
            .then =>
              expect(@loader.updated.calledOnce).to.be.true
              done()

      return null
