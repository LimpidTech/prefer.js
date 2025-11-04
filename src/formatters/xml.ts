import * as xml2js from 'xml2js';
import { Formatter } from './formatter';

const parserOptions: xml2js.ParserOptions = {
  explicitArray: false,
  explicitRoot: false,
  trim: true,
};

/**
 * XML formatter for parsing and stringifying XML configuration files
 */
export class XMLFormatter extends Formatter {
  private parser: xml2js.Parser;

  constructor() {
    super();
    this.parser = new xml2js.Parser(parserOptions);
  }

  protected async fromString<T = unknown>(asString: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.parser.parseString(asString, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result as T);
        }
      });
    });
  }

  protected async toString(asObject: unknown): Promise<string> {
    const builder = new xml2js.Builder();
    return builder.buildObject(asObject);
  }
}
