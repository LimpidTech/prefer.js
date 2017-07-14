import coffee from 'coffee-script'
import Formatter from './formatter'

export default class CoffeeFormatter extends Formatter {
  fromString(asString) {
    return coffee.eval(asString)
  }
}
