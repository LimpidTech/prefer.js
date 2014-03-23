loaders = require './loaders/defaults'
formatters = require './formatters/defaults'

events = require 'events'

Q = require 'q'
lodash = require 'lodash'
{resolveModule} = require './util'


class Prefer extends events.EventEmitter
  getEntity: (type, options) ->
    pluralType = type + 's'
    potentials = options[pluralType]

    matches = lodash.filter potentials, (potential) ->
      return potential.provides options.identifier

    unless matches.length
      throw new Error "
        No configuration #{type} found for #{options.identifier}
      "

    provider = lodash.first matches

    Entity = resolveModule provider.module
    return new Entity options

  getFormatter: (options) -> @getEntity 'formatter', options
  getLoader: (options) -> @getEntity 'loader', options

  format: (formatter) => (updates) =>
    deferred = Q.defer()

    formatter.parse updates, (err, context) =>
      return deferred.reject err if err
      @emit 'updated', context
      deferred.resolve context

    return deferred.promise

  load: (identifier, options) ->
    deferred = Q.defer()

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
    formatter = @getFormatter options

    format = @format formatter
    loader.on 'updated', format

    loader.load options.identifier, (err, results) ->
      return deferred.reject err if err

      format(results.content).then (context) ->
        deferred.resolve context

    return deferred.promise


instance = new Prefer
instance.Prefer = Prefer

module.exports = instance
