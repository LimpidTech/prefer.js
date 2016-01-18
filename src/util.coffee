resolveModule = (identifier, separator) ->
  separator ?= ':'
  attributeIndex = identifier.lastIndexOf separator

  if attributeIndex > -1
    attributeName = identifier[attributeIndex+1..]
    identifier = identifier[..attributeIndex-1]

  module = require identifier
  return module unless attributeName?

  attribute = module[attributeName]
  return attribute


adaptToCallback = (promise, callback) ->
  if callback?
    promise
      .then (result) -> callback null, result
      .fail callback

  return promise


proxyPromise = (deferred, promise) ->
  promise.then deferred.resolve
  promise.catch deferred.reject
  return deferred.promise


queryNestedKey = (obj, key) ->
  return obj unless key?

  key = key.slice 1 while key[0] is '.'

  stack = key.split '.'
  node = obj

  while stack.length and node
    nextLevel = stack.shift()
    node = node[nextLevel]

  return node


module.exports = {
  adaptToCallback
  proxyPromise
  queryNestedKey
  resolveModule
}
