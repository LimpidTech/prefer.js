/**
 * ConfigBuilder for layered configuration from multiple sources.
 *
 * Provides a fluent API for composing configuration from multiple sources
 * with full TypeScript support for typed configuration access.
 *
 * @example
 * ```typescript
 * interface AppConfig {
 *   port: number;
 *   database: {
 *     host: string;
 *     port: number;
 *   };
 * }
 *
 * const config = await new ConfigBuilder<AppConfig>()
 *   .addDefaults({ port: 8080, database: { host: 'localhost', port: 5432 } })
 *   .addFile('config.json')
 *   .addOptionalFile('config.local.json')
 *   .addEnv('MYAPP')
 *   .build();
 *
 * // Fully typed access
 * const port = config.get('port'); // number
 * const dbHost = config.get('database.host'); // string
 * ```
 */

import * as path from 'path';
import { Configurator, ConfigContext } from './configurator';
import { checkPrototypePollution } from './util';
import prefer from './index';

/**
 * Deep merge two objects, with override values taking precedence.
 * Nested objects are merged recursively.
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>
): T {
  const result = { ...base } as Record<string, unknown>;

  for (const key of Object.keys(override)) {
    checkPrototypePollution(key);
    const overrideValue = (override as Record<string, unknown>)[key];
    const baseValue = result[key];

    if (
      baseValue !== null &&
      overrideValue !== null &&
      typeof baseValue === 'object' &&
      typeof overrideValue === 'object' &&
      !Array.isArray(baseValue) &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>
      );
    } else {
      result[key] = overrideValue;
    }
  }

  return result as T;
}

/**
 * A source of configuration data.
 */
export interface Source<T = Record<string, unknown>> {
  /** Load configuration data from this source */
  load(): Promise<Partial<T>>;
}

/**
 * In-memory configuration source.
 */
export class MemorySource<T = Record<string, unknown>> implements Source<T> {
  constructor(private data: Partial<T>) {}

  async load(): Promise<Partial<T>> {
    // Return a shallow copy to prevent mutation
    return { ...this.data };
  }
}

/**
 * File-based configuration source.
 */
export class FileSource<T = Record<string, unknown>> implements Source<T> {
  constructor(
    private identifier: string,
    private required: boolean = true
  ) {}

  async load(): Promise<Partial<T>> {
    try {
      // For absolute paths, set search path to the file's directory
      const isAbsolute = path.isAbsolute(this.identifier);
      const options = isAbsolute
        ? {
            files: {
              searchPaths: [path.dirname(this.identifier)],
              watch: false,
            },
          }
        : {};

      const fileToLoad = isAbsolute
        ? path.basename(this.identifier)
        : this.identifier;

      const configurator = await prefer.load(fileToLoad, options);
      return configurator.context as Partial<T>;
    } catch (error) {
      if (!this.required) {
        return {} as Partial<T>;
      }
      throw error;
    }
  }
}

/**
 * Optional file source - returns empty object if file doesn't exist.
 */
export class OptionalFileSource<
  T = Record<string, unknown>,
> extends FileSource<T> {
  constructor(identifier: string) {
    super(identifier, false);
  }
}

/**
 * Environment variable source.
 *
 * Converts environment variables to nested configuration using separators.
 *
 * @example
 * ```typescript
 * // With MYAPP__DATABASE__HOST=localhost and MYAPP__DATABASE__PORT=5432
 * const source = new EnvSource('MYAPP');
 * const data = await source.load();
 * // { database: { host: 'localhost', port: '5432' } }
 * ```
 */
export class EnvSource<T = Record<string, unknown>> implements Source<T> {
  private prefix: string;
  private separator: string;

  constructor(prefix: string, separator: string = '__') {
    this.prefix = prefix.toUpperCase() + separator;
    this.separator = separator;
  }

  async load(): Promise<Partial<T>> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(process.env)) {
      if (!key.startsWith(this.prefix) || value === undefined) {
        continue;
      }

      // Remove prefix and convert to nested structure
      const configKey = key.slice(this.prefix.length).toLowerCase();
      const parts = configKey.split(this.separator);

      this.setNested(result, parts, value);
    }

    return result as Partial<T>;
  }

  private setNested(
    obj: Record<string, unknown>,
    parts: string[],
    value: string
  ): void {
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      checkPrototypePollution(part);

      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        if (!(part in current) || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }
    }
  }
}

/**
 * Type-safe path accessor for nested objects.
 * Converts dot-notation strings to their value types.
 */
type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : unknown
  : P extends keyof T
    ? T[P]
    : unknown;

/**
 * A typed configuration object with dot-notation access.
 */
export class TypedConfig<T extends Record<string, unknown>> {
  constructor(private data: T) {}

  /**
   * Get a value by dot-notation path with full type inference.
   *
   * @example
   * ```typescript
   * const config = new TypedConfig<{ db: { host: string } }>({ db: { host: 'localhost' } });
   * const host = config.get('db.host'); // type: string
   * ```
   */
  get<P extends string>(path: P): PathValue<T, P>;
  get<R = unknown>(path: string): R;
  get(path: string): unknown {
    const parts = path.split('.');
    let current: unknown = this.data;

    for (const part of parts) {
      checkPrototypePollution(part);
      if (current === null || current === undefined) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  /**
   * Get a string value, with optional default.
   */
  getString(path: string, defaultValue?: string): string | undefined {
    const value = this.get(path);
    if (typeof value === 'string') return value;
    if (defaultValue !== undefined) return defaultValue;
    return undefined;
  }

  /**
   * Get a number value, with optional default.
   * Parses string values from environment variables.
   */
  getNumber(path: string, defaultValue?: number): number | undefined {
    const value = this.get(path);
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) return parsed;
    }
    if (defaultValue !== undefined) return defaultValue;
    return undefined;
  }

  /**
   * Get a boolean value, with optional default.
   * Parses string values ('true', 'false', '1', '0') from environment variables.
   */
  getBoolean(path: string, defaultValue?: boolean): boolean | undefined {
    const value = this.get(path);
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
    }
    if (defaultValue !== undefined) return defaultValue;
    return undefined;
  }

  /**
   * Check if a path exists in the configuration.
   */
  has(path: string): boolean {
    return this.get(path) !== undefined;
  }

  /**
   * Get the entire configuration data.
   */
  all(): T {
    return this.data;
  }

  /**
   * Convert to a Configurator for compatibility with existing API.
   */
  toConfigurator(): Configurator {
    return new Configurator(this.data as ConfigContext);
  }
}

/**
 * Builder for creating layered configuration from multiple sources.
 *
 * Sources are applied in order, with later sources overriding earlier ones.
 * Deep merge is used for nested objects.
 *
 * @typeParam T - The configuration schema type
 *
 * @example
 * ```typescript
 * interface AppConfig {
 *   server: { port: number; host: string };
 *   database: { url: string };
 * }
 *
 * const config = await new ConfigBuilder<AppConfig>()
 *   .addDefaults({
 *     server: { port: 3000, host: 'localhost' },
 *     database: { url: 'postgres://localhost/dev' }
 *   })
 *   .addOptionalFile('config.local.json')
 *   .addEnv('APP')
 *   .build();
 *
 * // Type-safe access
 * const port = config.getNumber('server.port'); // number | undefined
 * const host = config.get('server.host'); // string (inferred)
 * ```
 */
export class ConfigBuilder<T extends Record<string, unknown> = Record<string, unknown>> {
  private sources: Source<T>[] = [];

  /**
   * Add a custom source to the configuration.
   */
  addSource(source: Source<T>): this {
    this.sources.push(source);
    return this;
  }

  /**
   * Add in-memory default values.
   */
  addDefaults(defaults: Partial<T>): this {
    return this.addSource(new MemorySource<T>(defaults));
  }

  /**
   * Add a required configuration file.
   * @throws Error if the file doesn't exist or can't be loaded
   */
  addFile(identifier: string): this {
    return this.addSource(new FileSource<T>(identifier, true));
  }

  /**
   * Add an optional configuration file.
   * If the file doesn't exist, it's silently skipped.
   */
  addOptionalFile(identifier: string): this {
    return this.addSource(new OptionalFileSource<T>(identifier));
  }

  /**
   * Add environment variables with the given prefix.
   *
   * Variables are converted to nested structure using the separator.
   * For example, with prefix 'MYAPP' and separator '__':
   * - MYAPP__DATABASE__HOST becomes database.host
   * - MYAPP__PORT becomes port
   *
   * @param prefix - Environment variable prefix
   * @param separator - Separator for nested keys (default: '__')
   */
  addEnv(prefix: string, separator: string = '__'): this {
    return this.addSource(new EnvSource<T>(prefix, separator));
  }

  /**
   * Build the final merged configuration.
   *
   * @returns A TypedConfig instance with all sources merged
   */
  async build(): Promise<TypedConfig<T>> {
    let merged: Record<string, unknown> = {};

    for (const source of this.sources) {
      const data = await source.load();
      merged = deepMerge(merged, data as Record<string, unknown>);
    }

    return new TypedConfig<T>(merged as T);
  }

  /**
   * Build and return a Configurator for compatibility with existing API.
   */
  async buildConfigurator(): Promise<Configurator> {
    const config = await this.build();
    return config.toConfigurator();
  }
}
