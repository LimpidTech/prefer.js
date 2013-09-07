_ = require 'lodash'
fs = require 'fs'
path = require 'path'
Step = require 'step'
winston = require 'winston'


getDefaultPaths = ->
  # TODO: Use proper separators for OS
  searchPaths = [
    './etc'
    './'
  ]

  if process.env.HOME?
    searchPaths.push process.env.HOME + '/.config/'
    searchPaths.push process.env.HOME + '/'

  searchPaths.push '/etc/'

  return searchPaths


class FileLoader
  options:
    files:
      searchPaths: getDefaultPaths()

  constructor: (options) ->
    options ?= {}

    @updateOptions options

  updateOptions: (options) ->
    options ?= {}

    _.extend @options, options

  find: (filename, callback) ->
    paths = _.filter _.map @options.files.searchPaths, (directory) ->
      relativePath = "#{directory}#{path.sep}#{filename}"
      absolutePath = path.resolve relativePath

      # TODO: Make this async but still reliable?
      exists = fs.existsSync absolutePath

      if exists
        return absolutePath
      else
        return false

    if paths.length
      callback null, paths[0]
    else
      callback new Error "Could not find configuration: #{ filename }."

  load: (filename, callback) ->
    @find filename, (err, filename) =>
      if err
        callback err
        return

      @get filename, callback

  get: (filename, callback) ->
    fs.readFile filename, 'UTF-8', (err, data) =>
      if err
        callback err
        return

      @parse data, callback

  parse: (data, callback) ->
    callback 'FileLoader must be inherited, not used directly.'

module.exports.Loader = FileLoader
