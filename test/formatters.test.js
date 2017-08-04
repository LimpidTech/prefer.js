import { stub } from 'sinon'
import {
  JSONFormatter,
  CSONFormatter,
  YAMLFormatter,
  INIFormatter,
  CoffeeFormatter,
  // XMLFormatter,
} from '../src/formatters'
import { fixture, normalize } from './helpers'

const record = {
  user: 'monokrome',
  domains: ['monokro.me', 'audalysis.com'],
}

describe('JSONFormatter', () => {
  const asString = fixture('json')

  describe('#parse', () => {
    it('converts the provided string to an object', done => {
      new JSONFormatter().parse(asString, (err, data) => {
        expect(err).toBe(null)
        expect(data).toEqual(record)
        done()
      })
    })

    it('provides an error to the callback when necessary', done => {
      const mockErr = new Error('Mock Error')
      const formatter = new JSONFormatter()

      stub(formatter, 'fromString').callsFake(() => {
        throw mockErr
      })

      formatter.parse(asString, err => {
        expect(err).toBe(mockErr)
        done()
      })
    })
  })

  describe('#stringify', () => {
    it('converts the provided object into a JSON string', done => {
      new JSONFormatter().stringify(record, (err, data) => {
        expect(err).toBe(null)
        expect(normalize(data)).toBe(asString)
        done()
      })
    })
  })
})

describe('YAMLFormatter', () => {
  const asString = fixture('yml')

  describe('#parse', () => {
    it('converts the provided string to an object', done => {
      new YAMLFormatter().parse(asString, (err, data) => {
        expect(err).toBe(null)
        expect(data).toEqual(record)
        done()
      })
    })
  })

  describe('#stringify', () => {
    it('converts the provided object into a YAML string', done => {
      new YAMLFormatter().stringify(record, (err, data) => {
        expect(err).toBe(null)
        expect(normalize(data)).toBe(asString)
        done()
      })
    })
  })
})

describe('INIFormatter', () => {
  const asString = fixture('ini')

  describe('#parse', () => {
    it('converts the provided string to an object', done => {
      new INIFormatter().parse(asString, (err, data) => {
        expect(err).toBe(null)
        expect(data).toEqual(record)
        done()
      })
    })
  })

  describe('#stringify', () => {
    it('converts the provided object into a INI string', done => {
      new INIFormatter().stringify(record, (err, data) => {
        expect(err).toBe(null)
        expect(normalize(data)).toBe(asString)
        done()
      })
    })
  })
})

describe('CoffeeFormatter', () => {
  const asString = fixture('coffee')

  describe('#parse', () => {
    it('converts the provided string to an object', done => {
      new CoffeeFormatter().parse(asString, (err, data) => {
        expect(err).toBe(null)
        expect(data).toEqual(record)
        done()
      })
    })
  })

  describe('#stringify', () => {
    it('throws an error since coffee can not be serialized', done => {
      new CoffeeFormatter().stringify(record, err => {
        expect(err).toBeInstanceOf(Error)
        done()
      })
    })
  })
})

describe('CSONFormatter', () => {
  const asString = fixture('cson')

  describe('#parse', () => {
    it('converts the provided string to an object', done => {
      new CSONFormatter().parse(asString, (err, data) => {
        expect(err).toBe(null)
        expect(data).toEqual(record)
        done()
      })
    })

    it('provides an error to the callback when necessary', done => {
      const error = new Error('Mock Error')
      const formatter = new CSONFormatter()

      stub(formatter, 'fromString').callsFake(() => {
        throw error
      })

      formatter.parse(asString, err => {
        expect(err).toBe(error)
        done()
      })
    })
  })

  describe('#stringify', () => {
    it('converts the provided object into a CSON string', done => {
      new CSONFormatter().stringify(record, (err, data) => {
        expect(err).toBe(null)
        expect(normalize(data)).toBe(asString)
        done()
      })
    })
  })
})

// describe('XMLFormatter', () => {
//   const asString = fixture('xml')
//   console.log('the fuck')

//   describe('#parse', () => {
//     it('converts the provided string to an object', done => {
//       console.log('honk honk', record)
//       debugger
//       new XMLFormatter().parse(asString, (err, data) => {
//         expect(err).toBe(null)
//         expect(data).toEqual(record)
//         done()
//       })
//     })
//   })

//   describe('#stringify', () => {
//     it('throws an error since XML can not be serialized', done => {
//       new XMLFormatter().stringify(record, err => {
//         expect(err).toBeInstanceOf(Error)
//         done()
//       })
//     })
//   })
// })
