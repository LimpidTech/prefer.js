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


module.exports = {Loader}
