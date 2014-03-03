{Configurator} = require './configurator'

loaders = require './loaders/defaults'
formatters = require './formatters/defaults'

lodash = require 'lodash'


class Prefer
  constructor: (options) ->
    options ?= {}

    options.loaders = lodash.merge {}, loaders, options.loaders
    options.formatters = lodash.merge {}, formatters, options.formatters

    @options = options


  resolveModule: (identifier, separator) ->
    separator ?= ':'

    attributeIndex = identifier.lastIndexOf separator

    if attributeIndex
      attributeName = identifier[attributeIndex+1..]
      identifier = identifier[..attributeIndex-1]

    result = require identifier

    if attributeName?
      result = result[attributeName]

    return result

  getConfigurator: (loader, formatter, options, callback) ->
    formatter.parse options.results.content, (err, context) ->
      if err
        callback err
      else
        configurator = new Configurator lodash.merge {}, options,
          loader: loader
          formatter: formatter
          context: context

        callback null, configurator

  getFormatter: (loader, options, callback) -> (err, results) =>
    return callback err if err

    if options.formatter?
      formatter = options.formatter

    else
      formatters = lodash.filter options.formatters, (potential) ->
        return potential.match results

      unless formatters.length
        throw new Error 'Could not find a formatter for ' + results.source

      {_, module} = lodash.first formatters
      formatter = @resolveModule module

    formatter = new formatter options if lodash.isFunction formatter

    options.results = results
    @getConfigurator loader, formatter, options, callback

  getLoader: (identifier, options) ->
    return if options.loader?

    matches = lodash.filter options.loaders, (potential) ->
      return potential.match identifier

    if matches.length is 0
      callback new Error 'No configuration loader found for: ' + identifier
      return

    match = lodash.first matches

    return @resolveModule match.module

  load: (identifier, options, callback) =>
    # Allow options to be optional.
    if lodash.isFunction options
      callback = options
      options = undefined

    options = lodash.merge {}, @options, options

    if options.loader?
      loader = options.loader
    else
      loader = @getLoader identifier, options

    # Instantiate a loader if it's a class
    loader = new loader options if lodash.isFunction loader

    getFormatter = @getFormatter loader, options, callback
    loader.load identifier, getFormatter


instance = new Prefer


module.exports = {
  load: instance.load
  Prefer: Prefer
}
