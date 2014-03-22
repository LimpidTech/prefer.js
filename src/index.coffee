{Configurator} = require './configurator'
{resolveModule} = require './util'

formatters = require './formatters/defaults'
loaders = require './loaders/defaults'

lodash = require 'lodash'


class Prefer
  constructor: (options) ->
    options ?= {}

    options.loaders = lodash.merge {}, loaders, options.loaders
    options.formatters = lodash.merge {}, formatters, options.formatters

    @options = options

  getConfigurator: (options, callback) ->
    configurator = new Configurator options, options.loader, options.formatter
    callback null, configurator

  getFormatter: (options, callback) -> (err, results) =>
    return callback err if err

    if options.formatter?
      formatter = options.formatter

    else
      {source, content} = results

      formatters = lodash.filter options.formatters, (potential) ->
        return potential.match results

      unless formatters.length
        return callback new Error '''
          Could not find formatter for ' + source
        '''

      {_, module} = lodash.first formatters
      formatter = resolveModule module

    options.results = results
    options.formatter = formatter

    formatter = new formatter options if lodash.isFunction formatter
    @getConfigurator options, callback

  getLoader: (identifier, options, callback) ->
    return if options.loader?

    matches = lodash.filter options.loaders, (potential) ->
      return potential.match identifier

    unless matches.length
      callback new Error 'No configuration loader found for: ' + identifier
      return null

    match = lodash.first matches
    return resolveModule match.module

  load: (identifier, options, callback) =>
    # Allow options to be optional.
    if lodash.isFunction options
      callback = options
      options = undefined

    options = lodash.merge {}, @options, options

    if options.loader?
      loader = options.loader
    else
      loader = @getLoader identifier, options, callback

    return unless loader?

    # Instantiate a loader if it's a class
    loader = new loader options if lodash.isFunction loader

    options.loader = loader
    getFormatter = @getFormatter options, callback

    loader.load identifier, getFormatter


instance = new Prefer


module.exports = {
  load: instance.load
  Prefer
}
