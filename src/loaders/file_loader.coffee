fs = require 'fs'
lodash = require 'lodash'
path = require 'path'
winston = require 'winston'
Q = require 'q'

pathing = require '../pathing'
{Loader} = require './loader'
{proxyPromise, adaptToCallback} = require '../util'


class FileLoader extends Loader
  options:
    files:
      watch: yes
      searchPaths: pathing.get()

  constructor: (options) ->
    @options = lodash.cloneDeep @options
    lodash.extend @options, options

  find: (filename, callback) ->
    deferred = Q.defer()
    searchPaths = @options.files.searchPaths

    promise = Q.allSettled lodash.map searchPaths, (directory) ->
      existance = Q.defer()

      relativePath = path.join directory, filename
      absolutePath = path.resolve relativePath

      fs.exists absolutePath, (result) -> existance.resolve absolutePath
      return existance.promise

    promise.then (paths) ->
      found = lodash.filter paths, (result) -> result.state is 'fulfilled'
      found = lodash.map found, (result) -> result.value

      if found.length
        deferred.resolve lodash.first found
      else
        deferred.reject new Error 'Could not find configuration: ' + filename

    adaptToCallback deferred.promise, callback
    return deferred.promise

  get: (filename, callback) =>
    deferred = Q.defer()

    options =
      encoding: 'UTF-8'

    fs.readFile filename, options, (err, data) =>
      return deferred.reject err if err

      deferred.resolve
        source: filename
        content: data

    adaptToCallback deferred.promise, callback
    return deferred.promise

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
    deferred = Q.defer()

    @find filename, (err, filename) =>
      if err
        deferred.reject err
      else
        proxyPromise deferred, @get filename
        @watch filename if @options.files.watch

    adaptToCallback deferred.promise, callback
    return deferred.promise


module.exports = {FileLoader}
