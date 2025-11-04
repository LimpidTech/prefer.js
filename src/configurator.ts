import cloneDeep from 'lodash/cloneDeep';
import {
  adaptToCallback,
  queryNestedKey,
  checkPrototypePollution,
  Callback,
} from './util';

/**
 * State object for tracking configuration updates and metadata.
 * 
 * This interface stores additional information about the configuration,
 * such as the source file path and original content.
 */
export interface ConfiguratorState {
  [key: string]: unknown;
}

/**
 * Configuration context containing the actual configuration data.
 * 
 * This is the parsed configuration object that can be queried and modified.
 */
export type ConfigContext = Record<string, unknown>;

/**
 * Configurator class for managing and accessing configuration data.
 * 
 * The Configurator provides a safe interface for reading and writing configuration
 * values with support for nested keys using dot notation. All operations return
 * deep clones to prevent accidental mutations.
 * 
 * @example
 * ```typescript
 * const config = {
 *   database: {
 *     host: 'localhost',
 *     port: 5432
 *   },
 *   api: {
 *     timeout: 3000
 *   }
 * };
 * 
 * const configurator = new Configurator(config);
 * 
 * // Get nested value
 * const host = await configurator.get('database.host');
 * // Returns: 'localhost'
 * 
 * // Set nested value
 * await configurator.set('database.port', 3306);
 * 
 * // Get entire config
 * const allConfig = await configurator.get();
 * ```
 */
export class Configurator {
  /** The configuration data */
  public context: ConfigContext;
  
  /** Additional state and metadata */
  public state: ConfiguratorState;

  constructor(context: ConfigContext, state: ConfiguratorState = {}) {
    this.context = context;
    this.state = state;
  }

  /**
   * Get a configuration value by key
   * @param key - Dot-separated key path (optional, returns entire context if omitted)
   * @param callback - Optional callback for backward compatibility
   * @returns Promise resolving to the configuration value
   */
  async get<T = unknown>(key?: string): Promise<T>;
  async get<T = unknown>(
    key: string | undefined,
    callback: Callback<T>
  ): Promise<T>;
  async get<T = unknown>(callback: Callback<T>): Promise<T>;
  async get<T = unknown>(
    keyOrCallback?: string | Callback<T>,
    callback?: Callback<T>
  ): Promise<T> {
    let key: string | undefined;
    let cb: Callback<T> | undefined;

    if (typeof keyOrCallback === 'function') {
      cb = keyOrCallback;
      key = undefined;
    } else {
      key = keyOrCallback;
      cb = callback;
    }

    const promise = (async () => {
      if (key) {
        const keyParts = key.split('.');
        for (const part of keyParts) {
          checkPrototypePollution(part);
        }
      }

      const node = queryNestedKey<T>(this.context, key);

      if (key && node === undefined) {
        throw new Error(`${key} does not exist in this configuration.`);
      }

      return cloneDeep(node) as T;
    })();

    return adaptToCallback(promise, cb);
  }

  /**
   * Set a configuration value
   * @param key - Dot-separated key path, or the entire context object
   * @param value - Value to set (optional if key is the context object)
   * @param callback - Optional callback for backward compatibility
   * @returns Promise resolving to the set value or context
   */
  async set(value: ConfigContext): Promise<ConfigContext>;
  async set(
    value: ConfigContext,
    callback: Callback<ConfigContext>
  ): Promise<ConfigContext>;
  async set(key: string, value: unknown): Promise<unknown>;
  async set(
    key: string,
    value: unknown,
    callback: Callback<unknown>
  ): Promise<unknown>;
  async set(callback: Callback<ConfigContext>): Promise<ConfigContext>;
  async set(
    keyOrValueOrCallback?: string | ConfigContext | Callback<ConfigContext>,
    valueOrCallback?: unknown | Callback<unknown | ConfigContext>,
    callback?: Callback<unknown>
  ): Promise<unknown | ConfigContext> {
    let key: string | undefined;
    let value: unknown | ConfigContext | undefined;
    let cb: Callback<unknown | ConfigContext> | undefined;

    if (typeof keyOrValueOrCallback === 'function') {
      cb = keyOrValueOrCallback as Callback<unknown | ConfigContext>;
      key = undefined;
      value = undefined;
    } else if (typeof keyOrValueOrCallback === 'string') {
      key = keyOrValueOrCallback;
      if (typeof valueOrCallback === 'function') {
        throw new Error('Value is required when key is provided');
      }
      value = valueOrCallback;
      cb = callback as Callback<unknown | ConfigContext> | undefined;
    } else if (keyOrValueOrCallback && typeof keyOrValueOrCallback === 'object') {
      value = keyOrValueOrCallback;
      key = undefined;
      cb = valueOrCallback as Callback<unknown | ConfigContext> | undefined;
    } else {
      key = undefined;
      value = undefined;
      cb = undefined;
    }

    const promise = (async () => {
      if (!key) {
        if (value !== undefined) {
          this.context = value as ConfigContext;
          return this.context;
        }
        return this.context;
      }

      const stack = key.split('.');
      let node: Record<string, unknown> = this.context;

      while (stack.length) {
        const item = stack.shift()!;
        checkPrototypePollution(item);

        if (stack.length) {
          if (!node[item] || typeof node[item] !== 'object') {
            Object.defineProperty(node, item, {
              value: Object.create(null),
              writable: true,
              enumerable: true,
              configurable: true,
            });
          }
          node = node[item] as Record<string, unknown>;
        } else {
          Object.defineProperty(node, item, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }

      return cloneDeep(value);
    })();

    return adaptToCallback(promise, cb);
  }
}
