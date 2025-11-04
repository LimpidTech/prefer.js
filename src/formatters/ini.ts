import * as ini from 'ini';
import { Formatter } from './formatter';

/**
 * INI formatter for parsing and stringifying INI configuration files
 */
export class INIFormatter extends Formatter {
  protected async fromString<T = unknown>(asString: string): Promise<T> {
    return ini.parse(asString) as T;
  }

  protected async toString(asObject: unknown): Promise<string> {
    return ini.stringify(asObject as Record<string, unknown>);
  }
}
