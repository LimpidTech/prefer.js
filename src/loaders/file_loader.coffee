{BaseLoader} = require './loader'

_ = require 'lodash'
fs = require 'fs'
path = require 'path'
Step = require 'step'
pathing = require '../pathing'
winston = require 'winston'


class FileLoader extends BaseLoader
  options:
    files:
      searchPaths: pathing.get()

  find: (filename, callback) ->
    paths = _.filter _.map @options.files.searchPaths, (directory) ->
      relativePath = path.join directory, filename
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

  get: (filename, callback) ->
    fs.readFile filename, 'UTF-8', (err, data) =>
      if err
        callback err
      else
        callback null,
          source: filename
          context: data

  load: (filename, callback) ->
    @find filename, (err, filename) =>
      if err
        callback err
      else
        @get filename, callback


module.exports = {FileLoader}
