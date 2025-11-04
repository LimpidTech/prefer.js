import * as yaml from 'js-yaml';
import { Formatter } from './formatter';

/**
 * YAML formatter for parsing and stringifying YAML configuration files
 */
export class YAMLFormatter extends Formatter {
  protected async fromString<T = unknown>(asString: string): Promise<T> {
    return yaml.load(asString) as T;
  }

  protected async toString(asObject: unknown): Promise<string> {
    return yaml.dump(asObject);
  }
}
