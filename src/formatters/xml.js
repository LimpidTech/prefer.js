import xml2js from 'xml2js'
import Formatter from './formatter'

const options = {
  explicitArray: false,
  explicitRoot: false,
  trim: true,
}

const parser = new xml2js.Parser(options)

export default class XMLFormatter extends Formatter {
  fromString(asString) {
    return parser.parseString(asString)
  }
}
