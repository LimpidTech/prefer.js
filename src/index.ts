import { EventEmitter } from 'events';
import { Configurator, ConfigContext, ConfiguratorState } from './configurator';
import { resolveModule, adaptToCallback, Callback } from './util';
import { defaultLoaders, LoaderProvider } from './loaders/defaults';
import { defaultFormatters, FormatterProvider } from './formatters/defaults';
import { Loader, LoaderOptions } from './loaders/loader';
import { Formatter } from './formatters/formatter';
import isString from 'lodash/isString';
import filter from 'lodash/filter';
import first from 'lodash/first';
import isFunction from 'lodash/isFunction';

/**
 * Options for loading configuration
 */
export interface PreferOptions extends LoaderOptions {
  identifier?: string;
  loaders?: LoaderProvider[];
  formatters?: FormatterProvider[];
}

/**
 * Update information from loaders
 */
interface LoaderUpdate {
  source: string;
  content: string;
}

/**
 * Prefer class for managing configuration loading
 */
export class Prefer extends EventEmitter {
  /**
   * Get an entity (loader or formatter) based on options
   */
  private getEntity<T>(
    type: 'loader' | 'formatter',
    options: PreferOptions,
    suggestion?: string | false
  ): T {
    const pluralType = type + 's';
    const potentials = (options as Record<string, unknown>)[pluralType] as
      | LoaderProvider[]
      | FormatterProvider[];

    let filterBy: string[];
    if (suggestion) {
      filterBy = [suggestion];
    } else if (options.identifier) {
      filterBy = [options.identifier];
    } else {
      throw new Error(`No identifier provided for ${type}`);
    }

    const matches = filter(potentials, (potential) => {
      const filterMatches = potential.provides(filterBy);
      return filterMatches.includes(true);
    });

    if (!matches.length) {
      throw new Error(
        `No configuration ${type} found for ${options.identifier}`
      );
    }

    const provider = first(matches)!;
    const Entity = resolveModule(provider.module) as new (
      options: PreferOptions
    ) => T;
    return new Entity(options);
  }

  /**
   * Get a formatter instance
   */
  private getFormatter(
    options: PreferOptions,
    suggestion?: string | false
  ): Formatter {
    return this.getEntity<Formatter>('formatter', options, suggestion);
  }

  /**
   * Get a loader instance
   */
  private getLoader(options: PreferOptions): Loader {
    return this.getEntity<Loader>('loader', options);
  }

  /**
   * Format loaded configuration data
   */
  private format(
    formatter: Formatter
  ): (updates: LoaderUpdate, isUpdate?: boolean) => Promise<Configurator> {
    return async (updates: LoaderUpdate, isUpdate: boolean = true) => {
      const context = await formatter.parse<ConfigContext>(updates.content);
      const state: ConfiguratorState = {
        source: updates.source,
        content: updates.content,
      };
      const configurator = new Configurator(context, state);

      if (isUpdate) {
        this.emit('updated', configurator);
      }

      return configurator;
    };
  }

  /**
   * Load configuration
   * @param identifier - Configuration identifier (filename or other identifier)
   * @param options - Load options
   * @param callback - Optional callback for backward compatibility
   * @returns Promise resolving to Configurator instance
   */
  async load(identifier: string): Promise<Configurator>;
  async load(options: PreferOptions): Promise<Configurator>;
  async load(
    identifier: string,
    options: PreferOptions
  ): Promise<Configurator>;
  async load(
    identifier: string,
    callback: Callback<Configurator>
  ): Promise<Configurator>;
  async load(
    identifier: string,
    options: PreferOptions,
    callback: Callback<Configurator>
  ): Promise<Configurator>;
  async load(
    identifierOrOptions: string | PreferOptions,
    optionsOrCallback?: PreferOptions | Callback<Configurator>,
    callback?: Callback<Configurator>
  ): Promise<Configurator> {
    let identifier: string | undefined;
    let options: PreferOptions;
    let cb: Callback<Configurator> | undefined;

    // Parse overloaded parameters
    if (isFunction(optionsOrCallback)) {
      // load(identifier, callback)
      identifier = identifierOrOptions as string;
      options = {};
      cb = optionsOrCallback as Callback<Configurator>;
    } else if (isString(identifierOrOptions)) {
      // load(identifier, options?, callback?)
      identifier = identifierOrOptions;
      options = (optionsOrCallback as PreferOptions) || {};
      cb = callback;
    } else {
      // load(options, callback?)
      options = identifierOrOptions as PreferOptions;
      identifier = options.identifier;
      cb = optionsOrCallback as Callback<Configurator> | undefined;
    }

    if (identifier) {
      options.identifier = identifier;
    }

    if (!options.identifier) {
      throw new Error('No identifier provided for configuration.');
    }

    options.loaders = options.loaders || defaultLoaders;
    options.formatters = options.formatters || defaultFormatters;

    const promise = (async () => {
      const loader = this.getLoader(options);

      const formatterRequired = await loader.formatterRequired(options);
      if (!formatterRequired) {
        throw new Error('Formatter is required but not available');
      }

      const suggestion = await loader.formatterSuggested(options);
      const formatter = this.getFormatter(options, suggestion);
      const format = this.format(formatter);

      // Set up update listener
      loader.on('updated', (updates: LoaderUpdate) => {
        format(updates).catch((err) => {
          this.emit('error', err);
        });
      });

      const result = await loader.load(options.identifier!);
      return format(result, false);
    })();

    return adaptToCallback(promise, cb);
  }
}

// Create singleton instance
const instance = new Prefer();

// Export both the instance and the class
export default instance;
export { Configurator } from './configurator';
export { Formatter } from './formatters/formatter';
export { Loader } from './loaders/loader';
export * from './util';

// ConfigBuilder API for layered configuration
export {
  ConfigBuilder,
  TypedConfig,
  Source,
  MemorySource,
  FileSource,
  OptionalFileSource,
  EnvSource,
  deepMerge,
} from './builder';
