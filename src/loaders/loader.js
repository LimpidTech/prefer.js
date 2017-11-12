import Promise from 'bluebird'
import { EventEmitter } from 'events'

export default class Loader extends EventEmitter {
  constructor(options) {
    super()
    this.updateOptions(options)
  }

  updateOptions(options) {
    this.options = { ...this.options, ...options }
  }

  updated(err, results) {
    if (err) return this.emit('updateFailed', err)
    this.emit('updated', results)
  }

  formatterSuggested() {
    return new Promise(resolve => resolve(false))
  }

  formatterRequired() {
    return new Promise(resolve => resolve(true))
  }
}
