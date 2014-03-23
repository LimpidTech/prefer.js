Q = require 'q'

events = require 'events'
lodash = require 'lodash'


class Loader extends events.EventEmitter
  constructor: (options) ->
    @updateOptions options

  updateOptions: (options) ->
    lodash.extend @options, {}, options

  updated: (err, results) ->
    return @emit 'updateFailed', err if err
    @emit 'updated', results

  formatterSuggested: ->
    deferred = Q.defer()
    deferred.resolve no
    return deferred.promise

  formatterRequired: ->
    deferred = Q.defer()
    deferred.resolve yes
    return deferred.promise

module.exports = {Loader}
