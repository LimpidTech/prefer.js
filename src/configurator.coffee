events = require 'events'
_ = require 'lodash'


class ConfigurationError extends Error


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

  set: (args...) ->
    return @options.context if args.length is 0

    if args.length > 1
      key = _.first args
      value = _.first _.filter args[1..]

      stack = key.split '.'
      node = @options.context

      # TODO: Should we prevent setting values on some types here?
      while stack.length
        item = stack.shift()

        if stack.length
          node[item] ?= {}
        else
          node[item] = value

        node = node[item]

      return node

    else
      @options.context = _.first args
      return @options.context


module.exports = {
  Configurator
  ConfigurationError
}
