defaultConfigurations = require './configurators/defaults'
defaultLoaders = require './loaders/defaults'
path = require 'path'

_ = require 'lodash'


resolveModule = (identifier, separator) ->
  separator ?= ':'

  attributeIndex = identifier.lastIndexOf separator

  if attributeIndex >= 0
    attributeName = identifier[attributeIndex + 1..]
    moduleName = identifier[..attributeIndex + 1]
  else
    moduleName = identifier

  containedModule = require moduleName

  if attributeName?
    return containedModule[attributeName]

  return containedModule


load = (identifier, options, callback) ->
  if _.isFunction options
    callback = options
    options = {}

  options ?= {}

  options.loaders ?= defaultLoaders
  options.configurations ?= defaultConfigurations

  extension = path.extname identifier

  loaderString = options.loaders[extension]

  if not options.loader?
    module = resolveModule loaderString

    Type = module.Loader
    loader = new Type options

  else
    loader = options.loader

  loader.load identifier, (err, context) ->
    if err
      callback err
      return

    configuratorString = options.configurations[loaderString]
    module = resolveModule configuratorString

    Type = module.Configurator
    configurator = new Type context, options

    callback 0, configurator


module.exports = {load}

