import events from 'events'

import Promise from 'bluebird'
import lodash from 'lodash'

import loaders from './loaders/defaults'
import formatters from './formatters/defaults'

import Configurator from './configurator'
import { resolveModule, adaptToCallback } from './util'

class Prefer extends events.EventEmitter {
  getEntity(type, options, suggestion) {
    const pluralType = `${type}s`
    const potentials = options[pluralType]

    let filterBy = suggestion || options.identifier
    if (lodash.isString(filterBy)) filterBy = [filterBy]
    if (!lodash.isArray(filterBy)) filterBy = lodash.toArray(filterBy)

    const matches = lodash.filter(potentials, potential => {
      const filterMatches = potential.provides(filterBy)
      return filterMatches.indexOf(true) !== -1
    })

    if (!matches.length)
      throw new Error(
        `No configuration ${type} found for ${options.identifier}`,
      )

    const provider = lodash.first(matches)
    const Entity = resolveModule(provider.module)

    return new Entity(options)
  }

  getFormatter(...args) {
    return this.getEntity('formatter', ...args)
  }

  getLoader(options) {
    return this.getEntity('loader', options)
  }

  format(formatter) {
    return (updates, isUpdate = true) => {
      return new Promise((resolve, reject) => {
        formatter
          .parse(updates.content)
          .then(context => {
            const configurator = new Configurator(context, updates)
            resolve(configurator)
            if (isUpdate) this.emit('updated', configurator)
          })
          .catch(reject)
      })
    }
  }

  load(identifier, options, callback) {
    if (lodash.isFunction(options)) {
      callback = options
      options = undefined
    }

    if (typeof identifier === 'object') options = identifier
    if (typeof options === 'undefined') options = {}
    if (lodash.isString(identifier)) options.identifier = identifier

    identifier = undefined

    if (!options || !options.identifier) {
      throw new Error('No identifier provided for configuration.')
    }

    identifier = undefined

    options.loaders = options.loaders || loaders
    options.formatters = options.formatters || formatters

    const promise = new Promise((resolve, reject) => {
      const loader = this.getLoader(options)

      const onFormatSuggested = suggestion => {
        const formatter = this.getFormatter(options, suggestion)
        const format = this.format(formatter)

        loader.on('updated', updates => format(updates))

        const onLoaded = result => format(result, false).then(resolve, reject)

        return loader.load(options.identifier).then(onLoaded, reject)
      }

      const onRequestFormat = shouldFormat =>
        loader.formatterSuggested(options).then(onFormatSuggested, reject)

      loader.formatterRequired(options).then(onRequestFormat, reject)
    })

    return adaptToCallback(promise, callback)
  }
}

export default new Prefer()
