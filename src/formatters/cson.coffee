CSON = require 'cson'
Q = require 'q'

{Formatter} = require './formatter'
{proxyPromise} = require '../util'


class CSONFormatter extends Formatter
  fromString: (asString, deferred) ->
    # This library does something crazy that makes Q.nfcall not work :/
    CSON.parse asString, (err, result) ->
      return deferred.reject err if err
      deferred.resolve result

  toString: (asObject, deferred) ->
    parsed = CSON.stringify asObject
    return deferred.resolve parsed if 'string' is typeof parsed
    deferred.reject parsed


module.exports = {CSONFormatter}
