loaders = require './loaders/defaults'
formatters = require './formatters/defaults'

events = require 'events'

Q = require 'q'
lodash = require 'lodash'

{Configurator} = require './configurator'
{resolveModule, adaptToCallback} = require './util'


class Prefer extends events.EventEmitter
  getEntity: (type, options, suggestion) ->
    pluralType = type + 's'
    potentials = options[pluralType]

    filterBy = suggestion or options.identifier
    filterBy = [filterBy] if lodash.isString filterBy
    filterBy = lodash.toArray filterBy unless lodash.isArray filterBy

    matches = lodash.filter potentials, (potential) ->
      filterMatches = potential.provides filterBy
      return true in filterMatches

    unless matches.length
      throw new Error "
        No configuration #{type} found for #{options.identifier}
      "

    provider = lodash.first matches

    Entity = resolveModule provider.module
    return new Entity options

  getFormatter: (args...) -> @getEntity 'formatter', args...
  getLoader: (options) -> @getEntity 'loader', options

  format: (formatter) -> (updates, isUpdate=true) =>
    deferred = Q.defer()

    promise = formatter.parse updates.content
    promise.then (context) =>
      configurator = new Configurator context, updates
      deferred.resolve configurator
      @emit 'updated', configurator if isUpdate

    promise.catch (err) -> deferred.reject err

    return deferred.promise

  load: (identifier, options, callback) ->
    deferred = Q.defer()

    if lodash.isFunction options
      callback = options
      options = undefined

    unless options?
      if lodash.isString identifier
        options = {}
      else
        options = identifier

    options.identifier = identifier if lodash.isString identifier
    identifier = undefined

    unless options?.identifier?
      throw new Error 'No identifier provided for configuration.'

    options.loaders ?= loaders
    options.formatters ?= formatters

    loader = @getLoader options
    formatter = null

    onFormatSuggested = (suggestion) =>
      formatter = @getFormatter options, suggestion
      format = @format formatter

      loader.on 'updated', (updates) -> format updates

      onLoaded = (result) ->
        format result, false
          .then deferred.resolve, deferred.reject

      loader.load options.identifier
        .then onLoaded, deferred.reject

    onRequestFormat = (shouldFormat) =>
      loader.formatterSuggested options
        .then onFormatSuggested, deferred.reject

    loader.formatterRequired options
      .then onRequestFormat, deferred.reject

    return adaptToCallback deferred.promise, callback


instance = new Prefer
instance.Prefer = Prefer


module.exports = instance
