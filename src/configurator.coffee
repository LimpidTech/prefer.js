lodash = require 'lodash'


class Configurator
  constructor: (@context) ->

  get: (key, callback) ->
    if not callback and lodash.isFunction key
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

    callback null, lodash.cloneDeep node

  set: (args...) ->
    return @context if args.length is 0

    if args.length > 1
      key = lodash.first args
      value = lodash.first lodash.filter args[1..]

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
      @context = lodash.first args
      return @context


module.exports = {Configurator}
