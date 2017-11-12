import yaml from 'js-yaml'
import Formatter from './formatter'

export default class YAMLFormatter extends Formatter {
  fromString(asString) {
    return yaml.load(asString)
  }

  toString(asObject) {
    return yaml.dump(asObject)
  }
}
