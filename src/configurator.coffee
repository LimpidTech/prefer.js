events = require 'events'
_ = require 'lodash'


class Configurator extends events.EventEmitter
  updated: (changes) =>
    formatter = @options.formatter
    formatter = new formatter if _.isFunction formatter

    formatter.parse changes.content, (err, updated) =>
      @options.context = updated
      @emit 'updated', @options.context

  constructor: (@options) ->
    @options.loader?.on 'updated', @updated
    
  get: (key, callback) ->
    if not callback and _.isFunction key
      callback = key
      key = undefined
      node = @options.context

    else
      node = @options.context
      stack = key.split '.'

      while stack.length and node
        nextLevel = stack.shift()
        node = node[nextLevel]

      unless node
        return callback new Error """
          #{ key } does not exist in this configuration.
        """

    callback null, _.cloneDeep node


module.exports = {Configurator}
