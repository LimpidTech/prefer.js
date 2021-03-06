Q = require 'q'
lodash = require 'lodash'
util = require './util'


class Configurator
  constructor: (@context, @state) ->

  get: (key, callback) ->
    deferred = Q.defer()
    node = @context

    if lodash.isFunction key
      callback = key
      key = undefined

    promise = util.adaptToCallback deferred.promise, callback

    if key?
      node = util.queryNestedKey node, key

      unless node
        deferred.reject new Error """
          #{ key } does not exist in this configuration.
        """
        return promise

    deferred.resolve lodash.cloneDeep node
    return promise

  set: (key, value, callback) ->
    deferred = Q.defer()

    if lodash.isFunction key
      callback = key
      key = undefined

    unless key?
      deferred.resolve @context

    else unless value?
      value = key
      key = undefined

      @context = value
      deferred.resolve @context

    else
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

      deferred.resolve lodash.cloneDeep node

    return util.adaptToCallback deferred.promise, callback


module.exports = {Configurator}
