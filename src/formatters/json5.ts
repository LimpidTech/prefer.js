import JSON5 from 'json5';
import { Formatter } from './formatter';

/**
 * JSON5 formatter for parsing and stringifying JSON5 configuration files
 * JSON5 is a superset of JSON that allows comments, trailing commas, and more
 */
export class JSON5Formatter extends Formatter {
  protected async fromString<T = unknown>(asString: string): Promise<T> {
    return JSON5.parse(asString) as T;
  }

  protected async toString(asObject: unknown): Promise<string> {
    return JSON5.stringify(asObject, null, 2);
  }
}
