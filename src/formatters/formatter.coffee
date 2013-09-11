class Formatter
  parse: (asString, callback) ->
    try
      @fromString asString, callback
    catch error
      callback error

  stringify: (asObject, callback) ->
    try
      return @toString asObject, callback
    catch error
      callback error


module.exports = {Formatter}