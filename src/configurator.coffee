events = require 'events'
_ = require 'lodash'


class Configurator extends events.EventEmitter
  format: (updates, callback) =>
    formatter = @formatter
    formatter = new formatter if _.isFunction formatter

    formatter.parse updates.content, (err, context) =>
      if err
        callback? err
        return

      @context = context
      @emit 'updated', @context
      callback? null, @

  constructor: (@options, @loader, @formatter, callback) ->
    @format @options.results, callback if @options.results?
    @loader?.on 'updated', @format

  get: (key, callback) ->
    if not callback and _.isFunction key
      callback = key
      key = undefined
      node = @context

    else
      node = @context
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
    return @context if args.length is 0

    if args.length > 1
      key = _.first args
      value = _.first _.filter args[1..]

      stack = key.split '.'
      node = @context

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
      @context = _.first args
      return @context


module.exports = {Configurator}
