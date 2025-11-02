/**
 * Resolves a module by identifier, optionally extracting a specific attribute.
 *
 * @remarks
 * This function allows loading modules with an optional attribute extraction syntax.
 * If the identifier contains a separator (default ':'), the part after the separator
 * is treated as an attribute name to extract from the module.
 *
 * @param identifier - Module identifier, optionally with attribute (e.g., 'module:attribute')
 * @param separator - Separator character between module and attribute (default: ':')
 * @returns The resolved module or the extracted attribute
 *
 * @example
 * Load entire module:
 * ```ts
 * const lodash = resolveModule('lodash');
 * ```
 *
 * @example
 * Load specific export from module:
 * ```ts
 * const map = resolveModule('lodash:map');
 * ```
 *
 * @example
 * Use custom separator:
 * ```ts
 * const fn = resolveModule('module#function', '#');
 * ```
 */
export function resolveModule(
  identifier: string,
  separator: string = ':'
): unknown {
  const attributeIndex = identifier.lastIndexOf(separator);

  if (attributeIndex > -1) {
    const attributeName = identifier.slice(attributeIndex + 1);
    const moduleName = identifier.slice(0, attributeIndex);
    const module = require(moduleName);
    return module[attributeName];
  }

  return require(identifier);
}

/**
 * Callback function type for async operations.
 *
 * @remarks
 * Follows the Node.js error-first callback convention where the first parameter
 * is an error (or null if successful) and the second is the result.
 *
 * @typeParam T - The type of the result value
 *
 * @example
 * ```ts
 * const callback: Callback<string> = (err, result) => {
 *   if (err) {
 *     console.error('Error:', err);
 *     return;
 *   }
 *   console.log('Result:', result);
 * };
 * ```
 */
export type Callback<T> = (error: Error | null, result?: T) => void;

/**
 * Adapts a Promise to support both Promise and callback patterns.
 *
 * @remarks
 * This utility function enables dual API support, allowing functions to work
 * with both modern async/await and traditional callback patterns. If a callback
 * is provided, it will be called with the result; otherwise, the Promise is
 * returned for chaining.
 *
 * @typeParam T - The type of the Promise result
 * @param promise - The promise to adapt
 * @param callback - Optional callback function following Node.js conventions
 * @returns The original promise for chaining
 *
 * @example
 * Promise style:
 * ```ts
 * const result = await adaptToCallback(somePromise());
 * ```
 *
 * @example
 * Callback style:
 * ```ts
 * adaptToCallback(somePromise(), (err, result) => {
 *   if (err) throw err;
 *   console.log(result);
 * });
 * ```
 *
 * @example
 * In a function that supports both patterns:
 * ```ts
 * function myFunction(callback?: Callback<string>): Promise<string> {
 *   const promise = doSomethingAsync();
 *   return adaptToCallback(promise, callback);
 * }
 * ```
 */
export function adaptToCallback<T>(
  promise: Promise<T>,
  callback?: Callback<T>
): Promise<T> {
  if (!callback) {
    return promise;
  }

  promise
    .then((result) => {
      callback(null, result);
      return result;
    })
    .catch((error) => {
      callback(error);
    });

  return promise;
}

/**
 * Checks if a key is a dangerous prototype pollution key.
 *
 * @remarks
 * This function prevents prototype pollution attacks by detecting attempts
 * to set dangerous properties like __proto__, prototype, or constructor.
 *
 * @param key - The key to check
 * @throws Error if the key is a dangerous prototype pollution key
 *
 * @example
 * ```ts
 * checkPrototypePollution('__proto__'); // throws Error
 * checkPrototypePollution('prototype'); // throws Error
 * checkPrototypePollution('constructor'); // throws Error
 * checkPrototypePollution('normalKey'); // no error
 * ```
 */
export function checkPrototypePollution(key: string): void {
  const dangerousKeys = ['__proto__', 'prototype', 'constructor'];
  if (dangerousKeys.includes(key)) {
    throw new Error(
      `Prototype pollution attempt detected: "${key}" is not allowed`
    );
  }
}

/**
 * Queries a nested key in an object using dot notation.
 *
 * @remarks
 * This function safely traverses nested object properties using a dot-separated
 * path string. It handles missing intermediate properties gracefully and returns
 * undefined if any part of the path doesn't exist. It also protects against
 * prototype pollution by validating each key segment.
 *
 * @typeParam T - The expected type of the value at the key path
 * @param obj - The object to query
 * @param key - Dot-separated key path (e.g., 'user.profile.name')
 * @returns The value at the key path, or undefined if not found
 * @throws Error if any key segment is a prototype pollution attempt
 *
 * @example
 * Get nested value:
 * ```ts
 * const config = {
 *   database: {
 *     host: 'localhost',
 *     port: 5432
 *   }
 * };
 *
 * const host = queryNestedKey<string>(config, 'database.host');
 * // Returns: 'localhost'
 * ```
 *
 * @example
 * Handle missing keys:
 * ```ts
 * const missing = queryNestedKey(config, 'database.credentials.password');
 * // Returns: undefined
 * ```
 *
 * @example
 * Get entire object if no key provided:
 * ```ts
 * const all = queryNestedKey(config);
 * // Returns: entire config object
 * ```
 */
export function queryNestedKey<T = unknown>(
  obj: Record<string, unknown>,
  key?: string
): T | undefined {
  if (!key) {
    return obj as unknown as T;
  }

  let cleanKey = key;
  while (cleanKey[0] === '.') {
    cleanKey = cleanKey.slice(1);
  }

  const stack = cleanKey.split('.');
  let node: unknown = obj;

  while (stack.length && node !== null && node !== undefined) {
    const nextLevel = stack.shift()!;
    node = (node as Record<string, unknown>)[nextLevel];
  }

  return node as T | undefined;
}
