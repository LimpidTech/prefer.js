Q = require 'q'
{adaptToCallback} = require '../util'


class Formatter
  toString: ->
    throw new Error 'The Formatter in use does not support serialization.'

  parse: (asString, callback) ->
    deferred = Q.defer()

    try
      @fromString asString, deferred
    catch error
      deferred.reject error

    return adaptToCallback deferred.promise, callback

  stringify: (asObject, callback) ->
    deferred = Q.defer()

    try
      @toString asObject, deferred
    catch error
      deferred.reject error

    return adaptToCallback deferred.promise, callback


module.exports = {Formatter}
