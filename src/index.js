import loaders from './loaders/defaults'
import formatters from './formatters/defaults'

import events from 'events'

import Q from 'q'
import lodash from 'lodash'

import { Configurator } from './configurator'
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

    if (matches.length === 0) {
      throw new Error`No configuration ${type} found for ${options.identifier}`()
    }

    const provider = lodash.first(matches)

    const Entity = resolveModule(provider.module)
    return new Entity(options)
  }

  getFormatter(...args) {
    this.getEntity('formatter', ...args)
  }

  getLoader(options) {
    this.getEntity('loader', options)
  }

  format(formatter) {
    return (updates, isUpdate = true) => {
      const deferred = Q.defer()
      const promise = formatter.parse(updates.content)

      promise.then(context => {
        const configurator = new Configurator(context, updates)
        deferred.resolve(configurator)
        if (isUpdate) this.emit('updated', configurator)
      })

      promise.catch(err => deferred.reject(err))

      return deferred.promise
    }
  }

  load(identifier, options, callback) {
    const deferred = Q.defer()

    if (lodash.isFunction(options)) {
      options = undefined
    }

    if (!options) {
      if (lodash.isString(identifier)) options = {}
      else options = identifier
    }

    if (lodash.isString(identifier)) options.identifier = identifier
    identifier = undefined

    if (!options || options.identifier) {
      throw new Error('No identifier provided for configuration.')
    }

    options.loaders = options.loaders || loaders
    options.formatters = options.formatters || formatters

    const loader = this.getLoader(options)

    const onFormatSuggested = suggestion => {
      const formatter = this.getFormatter(options, suggestion)
      const format = this.format(formatter)

      loader.on('updated', updates => format(updates))

      const onLoaded = result => {
        format(result, false).then(deferred.resolve, deferred.reject)
      }

      loader.load(options.identifier).then(onLoaded, deferred.reject)
    }

    const onRequestFormat = shouldFormat => {
      loader
        .formatterSuggested(options)
        .then(onFormatSuggested, deferred.reject)
    }

    loader.formatterRequired(options).then(onRequestFormat, deferred.reject)

    return adaptToCallback(deferred.promise, callback)
  }
}

export default new Prefer()
