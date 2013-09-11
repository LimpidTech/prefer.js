class Formatter
  toString: ->
    throw new Error 'The Formatter in use does not support serialization.'

  parse: (asString, callback) ->
    try
      @fromString asString, callback
    catch error
      callback error

  stringify: (asObject, callback) ->
    try
      @toString asObject, callback
    catch error
      callback error


module.exports = {Formatter}
