{Formatter} = require './formatter'

coffee = require 'coffee-script'


class CoffeeFormatter extends Formatter
  fromString: (asString, deferred) -> deferred.resolve coffee.eval asString


module.exports = {CoffeeFormatter}
