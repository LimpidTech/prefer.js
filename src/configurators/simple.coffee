class Configurator
  constructor: (@context, @options) ->

  get: (key, callback) ->
    if typeof key == 'function' and not callback
      callback null, @context
      return

    node = @context
    stack = key.split '.'

    while stack.length and node
      nextLevel = stack.shift()
      node = node[nextLevel]

    if node
      callback null, node
    else
      callback 'does not exist'

module.exports = {Configurator}

