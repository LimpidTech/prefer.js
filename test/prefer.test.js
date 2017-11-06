import path from 'path'
import Promise from 'bluebird'
import lodash from 'lodash'
import { stub } from 'sinon'

import prefer from '../src'
import FileLoader from '../src/loaders/file_loader'
import YAMLFormatter from '../src/formatters/yaml'
import { fixture } from './helpers'

describe('prefer', function() {
  beforeEach(() => {
    this.identifierBase = 'fixture'
    this.identifier = `${this.identifierBase}.yml`
    this.options = {
      identifier: this.identifier,
      loaders: require('../src/loaders/defaults'),
      formatters: require('../src/formatters/defaults'),
      files: {
        searchPaths: ['test/fixtures/'],
      },
    }

    this.fixtureString = fixture('json')
    this.fixture = JSON.parse(this.fixtureString)

    this.updates = {
      source: path.resolve(`test/fixtures/${this.identifier}`),
      content: this.fixtureString,
    }

    this.identifier = 'fixture.json'

    this.formatter = prefer.getFormatter(this.options)
    this.loader = prefer.getLoader(this.options)

    stub(this.formatter, 'parse', content => {
      deferred = Q.defer()
      deferred.resolve(this.fixture)
      return deferred.promise
    })
  })
})

describe('#getFormatter', function() {
  it('throws an error when no formatter exists', () => {
    const action = () =>
      prefer.getLoader({ identifier: this.identifier, formatters: [] })

    expect(action).toThrow()
  })

  it('returns the expected formatter', () => {
    expect(this.formatter).toBeInstanceOf(YAMLFormatter)
  })
})

describe('#getLoader', function() {
  it('throws an error when no loader exists', () => {
    const action = () =>
      prefer.getLoader({ identifier: this.identifier, loaders: [] })

    expect(action).toThrow()
  })

  it('returns the expected loader', () => {
    expect(this.loader).toBeInstanceOf(FileLoader)
  })
})

describe('#format returns a function that', function() {
  beforeEach(() => {
    this.format = prefer.format(this.formatter)
    this.promise = this.format(this.updates)
  })

  it('wraps #formatter.parse', () => {
    expect(this.formatter.parse.calledOnce).toBe(true)
  })

  it('returns a promise which provides a formatted context', done => {
    this.promise.then(result =>
      result.get((err, context) => {
        expect(context).toEqual(this.fixture)
        done()
      }),
    )
  })
})

describe('#load', () => {
  it('returns a promise that provides the configuration', done => {
    const options = lodash.cloneDeep(this.options)
    const promise = prefer.load(options)
    promise.then(result => {
      result.get((err, context) => {
        expect(context).toEqual(this.fixture)
        done()
      })
    })
  })

  it('supports callback style usage', done => {
    const options = lodash.cloneDeep(this.options)
    prefer.load(options, (err, result) => {
      result.get((err, context) => {
        expect(context).toEqual(this.fixture)
        done()
      })
    })
  })

  it('allows identifier as a string', () => {
    const action = () => prefer.load(this.identifier)
    action()
  })

  it('throws an error without an identifier', () => {
    const action = () => prefer.load()
    expect(action).toThrow()
  })

  it('loads configurations without requiring their format', () => {
    const action = () => prefer.load(this.identifier)
    action()
  })
})
