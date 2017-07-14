import P from 'bluebird'
import { adaptToCallback } from '../util'

export default class Formatter {
  toString() {
    throw new Error('The Formatter in use does not support serialization.')
  }

  parse(asString, callback) {
    const promise = new P((resolve, reject) => {
      try {
        resolve(this.fromString(asString))
      } catch (err) {
        reject(err)
      }
    })

    return adaptToCallback(promise, callback)
  }

  stringify(asObject, callback) {
    const promise = new P((resolve, reject) => {
      try {
        resolve(this.toString(asObject))
      } catch (err) {
        reject(err)
      }
    })

    return adaptToCallback(promise, callback)
  }
}
