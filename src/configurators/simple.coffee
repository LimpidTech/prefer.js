class SimpleConfigurator
  constructor: (@context, @options) ->

  getKey: (key, callback) ->
    node = @context
    stack = key.split '.'

    while stack.length and node
      nextLevel = stack.shift()
      node = node[nextLevel]

    if node
      callback null, node
    else
      callback 'does not exist'

  get: (key, callback) ->
    if typeof key == 'function' and not callback
      callback = key
      key = undefined

      callback null, @context

    else
      @getKey key, callback


module.exports = {
  Configurator: SimpleConfigurator
}

