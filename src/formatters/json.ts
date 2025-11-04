import { Formatter } from './formatter';

/**
 * JSON formatter for parsing and stringifying JSON configuration files
 */
export class JSONFormatter extends Formatter {
  protected async fromString<T = unknown>(asString: string): Promise<T> {
    return JSON.parse(asString) as T;
  }

  protected async toString(asObject: unknown): Promise<string> {
    return JSON.stringify(asObject, null, 2);
  }
}
