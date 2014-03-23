{Loader} = require './loader'

fs = require 'fs'
lodash = require 'lodash'
path = require 'path'
pathing = require '../pathing'
winston = require 'winston'


class FileLoader extends Loader
  options:
    files:
      watch: yes
      searchPaths: pathing.get()

  constructor: (options) ->
    @options = lodash.cloneDeep @options
    lodash.extend @options, options

  find: (filename, callback) ->
    searchPaths = @options.files.searchPaths
    paths = lodash.filter lodash.map searchPaths, (directory) ->
      relativePath = path.join directory, filename
      absolutePath = path.resolve relativePath

      # TODO: Make this async but still reliable?
      exists = fs.existsSync absolutePath

      return absolutePath if exists
      return false

    if paths.length
      callback null, paths[0]
    else
      callback new Error 'Could not find configuration: ' + filename

  get: (filename, callback) =>
    options =
      encoding: 'UTF-8'

    fs.readFile filename, options, (err, data) =>
      return callback err if err

      callback null,
        source: filename
        content: data

  # fs.watch does not reliably provide the filename back to us, so this
  # closure protects us from the situation where a filename is not provided.
  getChangeHandler: (filename) -> (event) =>
    @emit event, filename
    @get filename, (args...) => @updated args...
  
  watch: (filename) ->
    options =
      persistent: false

    fs.watch filename, options, @getChangeHandler filename

  load: (filename, callback) ->
    @find filename, (err, filename) =>
      if err
        callback err
      else
        @get filename, callback
        @watch filename if @options.files.watch


module.exports = {FileLoader}
