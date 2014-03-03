class Configurator
  constructor: (@options) ->

  getKey: (key, callback) ->
    node = @options.context
    stack = key.split '.'

    while stack.length and node
      nextLevel = stack.shift()
      node = node[nextLevel]

    if node
      callback null, node
    else
      callback new Error key + ' does not exist in this configuration.'

  get: (key, callback) ->
    if typeof key == 'function' and not callback
      callback = key
      key = undefined

      callback null, @options.context

    else
      @getKey key, callback


module.exports = {Configurator}
