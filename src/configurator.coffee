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

  set: (key, value) ->
    if value?
      stack = key.split '.'
      node = @options.context

      while stack.length > 1
        item = stack.shift()
        node[item] ?= {}

        if _.isObject node
          node = node[item]
        else
          throw new Error 'Can not set a value on ' + node.toString()

      item = stack.shift()
      node[item] = value

      return node[item]

    else
      value = key
      key = undefined

      @options.context = value
      return @options.context


module.exports = {
  Configurator
  ConfigurationError
}
