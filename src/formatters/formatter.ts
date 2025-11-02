import { adaptToCallback, Callback } from '../util';

/**
 * Base Formatter class for parsing and stringifying configuration data
 */
export abstract class Formatter {
  /**
   * Parse a string into an object
   * @param asString - String representation of configuration
   * @param callback - Optional callback for backward compatibility
   * @returns Promise resolving to parsed object
   */
  async parse<T = unknown>(asString: string): Promise<T>;
  async parse<T = unknown>(
    asString: string,
    callback: Callback<T>
  ): Promise<T>;
  async parse<T = unknown>(
    asString: string,
    callback?: Callback<T>
  ): Promise<T> {
    const promise = (async () => {
      return this.fromString<T>(asString);
    })();

    return adaptToCallback(promise, callback);
  }

  /**
   * Stringify an object into a string
   * @param asObject - Object to stringify
   * @param callback - Optional callback for backward compatibility
   * @returns Promise resolving to string representation
   */
  async stringify(asObject: unknown): Promise<string>;
  async stringify(
    asObject: unknown,
    callback: Callback<string>
  ): Promise<string>;
  async stringify(
    asObject: unknown,
    callback?: Callback<string>
  ): Promise<string> {
    const promise = (async () => {
      return this.toString(asObject);
    })();

    return adaptToCallback(promise, callback);
  }

  /**
   * Convert string to object - must be implemented by subclasses
   * @param asString - String to parse
   * @returns Parsed object
   */
  protected abstract fromString<T = unknown>(asString: string): Promise<T>;

  /**
   * Convert object to string - must be implemented by subclasses
   * @param asObject - Object to stringify
   * @returns String representation
   */
  protected abstract toString(asObject: unknown): Promise<string>;
}
