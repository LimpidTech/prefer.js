import * as TOML from 'smol-toml';
import { Formatter } from './formatter';

/**
 * TOML formatter for parsing and stringifying TOML configuration files
 */
export class TOMLFormatter extends Formatter {
  protected async fromString<T = unknown>(asString: string): Promise<T> {
    return TOML.parse(asString) as T;
  }

  protected async toString(asObject: unknown): Promise<string> {
    return TOML.stringify(asObject as Record<string, unknown>);
  }
}
