export function resolveModule(identifier) {
  try {
    const module = require(identifier)
  } catch (e) {
    console.error('ERROR', e)
  }
  console.log(module)
  return module.default || module
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
