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
  return promise unless callback?

  onSuccess = (result) ->
    callback null, result
    return result

  return promise.done onSuccess, callback


proxyPromise = (deferred, promise) ->
  return promise.then deferred.resolve, deferred.reject


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
