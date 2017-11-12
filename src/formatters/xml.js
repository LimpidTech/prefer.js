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
    let result = null
    // TODO: error check
    parser.parseString(asString, (err, parsed) => (result = parsed))
    return result
  }
}
