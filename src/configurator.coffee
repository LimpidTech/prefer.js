events = require 'events'


class Configurator extends events.EventEmitter
  updated: (changes) =>
    formatter = new @options.formatter

    formatter.parse changes.content, (err, updated) =>
      @options.context = updated
      @emit 'updated', @options.context

  constructor: (@options) ->
    @options.loader?.on 'updated', @updated
    
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
