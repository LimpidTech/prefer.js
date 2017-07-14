import CSON from 'cson'
import Formatter from './formatter'

export default class CSONFormatter extends Formatter {
  fromString(asString) {
    return CSON.parse(asString)
  }

  toString(asObject) {
    return CSON.stringify(asObject)
  }
}
