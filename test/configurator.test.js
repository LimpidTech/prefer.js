import { spy } from 'sinon'
import Configurator from '../src/configurator'
import { fixture } from './helpers'

describe('Configurator', function() {
  beforeEach(() => {
    this.state = {}
    this.fixture = JSON.parse(fixture('json'))
    this.configurator = new Configurator(this.fixture, this.state)
  })

  describe('#constructor', () => {
    it('sets #context to the provided context', () => {
      expect(this.configurator.context).toEqual(this.fixture)
    })

    it('sets #state to the provided state', () => {
      expect(this.configurator.state).toEqual(this.state)
    })
  })

  describe('#get', () => {
    it('provides an error when the provided key does not exist', done => {
      this.configurator.get(
        'imaginaryKey',
        spy(err => {
          expect(err).toBeInstanceOf(Error)
          done()
        }),
      )
    })

    it('provides the entire context if no key is provided', done => {
      this.configurator.get(
        spy((err, data) => {
          expect(data).toEqual(this.fixture)
          done()
        }),
      )
    })

    it('provides data associated with the provided key', done => {
      this.configurator.get(
        'user',
        spy((err, data) => {
          expect(data).toEqual('monokrome')
          done()
        }),
      )
    })

    it('provides all data when no key is provided', done => {
      this.configurator.get().then(data => {
        expect(data).toEqual(this.fixture)
        done()
      })
    })
  })

  describe('#set', () => {
    const data = { example: 'data' }

    // TODO For some reason this causes the other tests to skip.
    // it.only(
    //   'resolves an unchanged context without any key or value provided',
    //   done => {
    //     this.configurator.set((err, context) => {
    //       expect(context).toEqual(this.fixture)
    //       expect(this.configurator.context).toEqual(this.fixture)
    //       done()
    //     })
    //   },
    // )

    it('updates the context with the provided value', done => {
      this.configurator.set(data)
      this.configurator.get((err, context) => {
        expect(context).toEqual(data)
        done()
      })
    })

    it('updates a key in the context with the provided value', done => {
      this.configurator.set('fake.key.here', data)
      this.configurator.get('fake.key.here', (err, context) => {
        expect(context).toEqual(data)
        done()
      })
    })
  })
})
