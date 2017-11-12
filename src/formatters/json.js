import Formatter from './formatter'

export default class JSONFormatter extends Formatter {
  fromString(asString) {
    return JSON.parse(asString)
  }

  toString(asObject) {
    return JSON.stringify(asObject)
  }
}
