Q = require 'q'
fs = require 'fs'
lodash = require 'lodash'
path = require 'path'
winston = require 'winston'

pathing = require '../pathing'
{Loader} = require './loader'
{proxyPromise, adaptToCallback} = require '../util'


class FileLoader extends Loader
  options:
    files:
      watch: yes
      searchPaths: pathing.get()

  formatterSuggested: (options) ->
    deferred = Q.defer()

    baseName = path.basename options.identifier
    dotIndex = baseName.lastIndexOf '.'

    if dotIndex > -1
      extensionIndex = dotIndex + 1
      deferred.resolve baseName[extensionIndex..]

    else
      search = @find options.identifier, true
      search.then (result) -> deferred.resolve result

    return deferred.promise

  constructor: (options) ->
    @options = lodash.cloneDeep @options
    lodash.extend @options, options

  findByPrefix: (directory, fileName) ->
    deferred = Q.defer()

    read = Q.nfcall fs.readdir, directory
    read.then (fileNames) ->
      matches = lodash.filter fileNames, (potentialFileName) ->
        index = potentialFileName.indexOf fileName
        return true if index is 0
      deferred.resolve matches

    read.catch (err) -> deferred.reject err

    return deferred.promise
            
  find: (filename, asPrefix=false, callback) ->
    deferred = Q.defer()
    searchPaths = @options.files.searchPaths

    promise = Q.allSettled lodash.map searchPaths, (directory) =>
      existance = Q.defer()

      relativePath = path.join directory, filename
      absolutePath = path.resolve relativePath

      if asPrefix
        absoluteDirectoryPath = path.resolve directory

        findMatches = @findByPrefix absoluteDirectoryPath, filename
        findMatches.then (matches) ->
          existance.resolve lodash.map matches, (match) ->
            return path.join absoluteDirectoryPath, match
        findMatches.catch (err) -> existance.reject err

      else
        fs.exists absolutePath, (result) -> existance.resolve absolutePath

      return existance.promise

    promise.then (paths) ->
      found = lodash.filter paths, (result) -> result.state is 'fulfilled'
      found = lodash.map found, (result) -> result.value

      if asPrefix
        deferred.resolve lodash.filter lodash.flatten found
      else
        deferred.resolve lodash.first found

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

  load: (requestedFilename, callback) ->
    deferred = Q.defer()

    baseName = path.basename requestedFilename
    dotIndex = baseName.lastIndexOf '.'

    shouldDetermineFormat = dotIndex is -1

    findPromise = @find requestedFilename, shouldDetermineFormat

    if shouldDetermineFormat
      findPromise.then (files) ->
        return lodash.first files if files.length

        deferred.reject new Error "
          No configuration files found matching #{ requestedFilename }.
        "

    findPromise.then (filename) =>
      proxyPromise deferred, @get filename
      @watch filename if @options.files.watch

    findPromise.catch deferred.reject

    return adaptToCallback deferred.promise, callback


module.exports = {FileLoader}
