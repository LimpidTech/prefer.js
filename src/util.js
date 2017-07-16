export function resolveModule(identifier, separator = ':') {
  const attributeIndex = identifier.lastIndexOf(separator)
  let attributeName

  if (attributeIndex > -1) {
    attributeName = identifier.slice(attributeIndex + 1)
    identifier = identifier.slice(0, attributeIndex)
  }

  const module = require(identifier)
  return module[attributeName] || module
}

export function adaptToCallback(promise, callback) {
  if (!callback) return promise

  function onSuccess(result) {
    callback(null, result)
    return result
  }

  return promise.then(onSuccess, callback)
}

export function proxyPromise(promise) {
  return promise.then(promise.resolve, promise.reject)
}

export function queryNestedKey(obj, key) {
  if (!key) return obj

  while (key[0] === '.') key = key.slice(1)

  const stack = key.split('.')
  let node = obj

  while (stack.length && node) node = node[stack.shift()]

  return node
}
