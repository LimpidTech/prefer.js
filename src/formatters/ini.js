import ini from 'ini'
import Formatter from './formatter'

export default class INIFormatter extends Formatter {
  fromString(asString) {
    return ini.decode(asString)
  }

  toString(asObject) {
    return ini.encode(asObject)
  }
}
