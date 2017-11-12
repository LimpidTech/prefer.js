import Promise from 'bluebird'
import { isFunction, cloneDeep } from 'lodash'
import { adaptToCallback, queryNestedKey } from './util'

export default class Configurator {
  constructor(context, state) {
    this.context = context
    this.state = state
  }

  get(key, callback) {
    let node = this.context

    if (isFunction(key)) {
      callback = key
      key = undefined
    } else if (key) {
      node = queryNestedKey(node, key)
      if (!node) {
        return callback(
          new Error(`'${key}' does not exist in this configuration.`),
        )
      }
    }

    const promise = new Promise((resolve, reject) => {
      try {
        resolve(cloneDeep(node))
      } catch (err) {
        reject(err)
      }
    })

    adaptToCallback(promise, callback)

    return promise
  }

  set(key, value, callback) {
    if (isFunction(key)) {
      callback = key
      key = undefined
    }

    const promise = new Promise(resolve => {
      if (!key) {
        resolve(this.context)
      } else if (!value) {
        value = key
        key = undefined
        resolve((this.context = value))
      } else {
        const stack = key.split('.')
        let node = this.context

        // TODO: Should we prevent setting values on some types here?
        while (stack.length) {
          const item = stack.shift()

          if (stack.length) node[item] = node[item] || {}
          else node[item] = value

          node = node[item]
        }

        resolve(cloneDeep(node))
      }
    })

    return adaptToCallback(promise, callback)
  }
}
