import { EventEmitter } from 'events';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Options for loader configuration
 */
export interface LoaderOptions {
  identifier?: string;
  [key: string]: unknown;
}

/**
 * Result from loading configuration
 */
export interface LoadResult {
  source: string;
  content: string;
}

/**
 * Base Loader class for loading configuration from various sources
 */
export class Loader extends EventEmitter {
  protected options: LoaderOptions;

  constructor(options: LoaderOptions = {}) {
    super();
    this.options = {};
    this.updateOptions(options);
  }

  /**
   * Update loader options
   */
  updateOptions(options: LoaderOptions): void {
    this.options = { ...cloneDeep(this.options), ...options };
  }

  /**
   * Handle update events
   */
  updated(err: Error | null, results?: LoadResult): void {
    if (err) {
      this.emit('updateFailed', err);
    } else {
      this.emit('updated', results);
    }
  }

  /**
   * Suggest a formatter based on the identifier
   * @returns Promise resolving to suggested format or false
   */
  async formatterSuggested(
    _options: LoaderOptions
  ): Promise<string | false> {
    return false;
  }

  /**
   * Check if a formatter is required
   * @returns Promise resolving to true if formatter is required
   */
  async formatterRequired(_options: LoaderOptions): Promise<boolean> {
    return true;
  }

  /**
   * Load configuration - must be implemented by subclasses
   */
  async load(
    _requestedFilename: string,
    _callback?: (err: Error | null, result?: LoadResult) => void
  ): Promise<LoadResult> {
    throw new Error('load() must be implemented by subclass');
  }
}
