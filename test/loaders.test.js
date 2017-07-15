import fs from 'fs'
import path from 'path'
import { sandbox, stub, spy } from 'sinon'
import { Loader, FileLoader } from '../src/loaders'

class FakeError {}

describe('Loader', function() {
  beforeEach(() => {
    this.loader = new Loader()
  })

  describe('#updated', () => {
    it('should emit "updated" without error', () => {
      this.loader.updated(null)
    })

    it('should emit "updateFailed" with an error', () => {
      this.loader.updated(new Error('Fake error'))
    })
  })

  describe('#formatterRequired', () => {
    it('should default to true', done => {
      this.loader.formatterRequired().then(result => {
        expect(result).toBe(true)
        done()
      })
    })
  })

  describe('#formatterSuggested', () => {
    it('should not suggest formatters by default', done => {
      this.loader.formatterSuggested().then(result => {
        expect(result).toBe(false)
        done()
      })
    })
  })
})

describe('FileLoader', function() {
  beforeEach(() => {
    this.fixturesPath = path.resolve('test/fixtures')
    this.identifierBase = 'fixture'
    this.identifier = `${this.identifierBase}.json`
    this.loader = new FileLoader({
      files: {
        watch: false,
        searchPaths: ['test/fixtures/'],
      },
    })
  })

  describe('#load', () => {
    it('results in a not found error if no file was found', () => {
      expect(() => this.loader.load('fakeFile')).toThrow()
    })

    it('throws an error if reading the requested file fails', done => {
      const box = sandbox.create()

      box.stub(fs, 'readFile').callsFake((filename, encoding, callback) => {
        callback(new FakeError('Fake error for testing failure reading files.'))
      })

      this.loader.load(
        'fixture.json',
        spy(err => {
          expect(err).toBeInstanceOf(FakeError)
          box.restore()
          done()
        }),
      )
    })
  })

  describe('#formatterRequired', () => {
    it('should always result as true', done => {
      this.loader.formatterRequired().then(result => {
        expect(result).toBe(true)
        done()
      })
    })
  })

  describe('#formatterSuggested', () => {
    it("should suggest a formatter using it's file extension", done => {
      this.loader
        .formatterSuggested({
          identifier: this.identifier,
        })
        .then(result => {
          expect(result).toBe('json')
          done()
        })
    })

    it('should find all possible configurations when no extension is provided', done => {
      let absoluteFileNames

      fs.readdir(this.fixturesPath, (err, fileNames) => {
        absoluteFileNames = fileNames.map(fileName =>
          path.join(this.fixturesPath, fileName),
        )
      })

      this.loader
        .formatterSuggested({
          identifier: this.identifierBase,
        })
        .then(result => {
          expect(absoluteFileNames).toEqual(result)
          done()
        })
    })
  })

  describe('#changed', () => {
    it('emits the provided event', done => {
      this.loader.load('fixture.json', (err, results) => {
        this.loader.on('changed', filename => {
          expect(filename).toBe(results.source)
          done()
        })

        this.loader.getChangeHandler(results.source)('changed')
      })
    })
  })

  describe('#watch', function() {
    stub(fs, 'watch')

    afterEach(() => fs.watch.restore())
    beforeEach(() => {
      this.loader = new FileLoader({
        files: {
          watch: true,
          searchPaths: ['test/fixtures/'],
        },
      })
    })

    it('calls the handler returned from #changed when files change', done => {
      const changedHandler = stub()
      const changed = stub(this.loader, 'getChangeHandler')

      changed.returns(changedHandler)

      this.loader.load('fixture.json', (err, results) => {
        expect(fs.watch.calledOnce).toBe(true)
        expect(
          fs.watch.calledWith(
            results.source,
            { persistent: false },
            changedHandler,
          ),
        ).toBe(true)

        changed.restore()
        done()
      })
    })

    it('calls #updated when new configuration is ready', done => {
      this.loader.load(
        'fixture.json',
        spy((err, results) => {
          this.loader.updated = stub(
            this.loader,
            'updated',
          ).callsFake((err, results) => {
            expect(this.loader.updated.calledOnce).toBe(true)
            expect(err).toBe(null)
            expect(results).toEqual(results)

            this.loader.updated.restore()
            done()
          })

          expect(this.loader.updated.notCalled).toBe(true)

          // fs.watch will call this in the real world
          this.loader.getChangeHandler(results.source)('changed')
        }),
      )
    })
  })
})
