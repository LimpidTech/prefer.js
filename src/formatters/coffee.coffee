{Formatter} = require './formatter'

coffee = require 'coffee-script'


class CoffeeFormatter extends Formatter
  fromString: (asString, callback) ->
    callback null, coffee.eval asString


module.exports = {CoffeeFormatter}
