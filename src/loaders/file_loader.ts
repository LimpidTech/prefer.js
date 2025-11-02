import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { Loader, LoaderOptions, LoadResult } from './loader';
import * as pathing from '../pathing';
import { adaptToCallback, Callback } from '../util';

/**
 * File loader options
 */
export interface FileLoaderOptions extends LoaderOptions {
  files?: {
    watch?: boolean;
    searchPaths?: string[];
  };
}

/**
 * FileLoader for loading configuration from files
 */
export class FileLoader extends Loader {
  protected options: FileLoaderOptions;

  constructor(options: FileLoaderOptions = {}) {
    super(options);
    this.options = {
      files: {
        watch: true,
        searchPaths: pathing.get(),
      },
      ...options,
    };
  }

  /**
   * Suggest formatter based on file extension
   */
  async formatterSuggested(
    options: LoaderOptions
  ): Promise<string | false> {
    if (!options.identifier) {
      return false;
    }

    const baseName = path.basename(options.identifier);
    const dotIndex = baseName.lastIndexOf('.');

    if (dotIndex > -1) {
      const extensionIndex = dotIndex + 1;
      return baseName.slice(extensionIndex);
    }

    // Try to find file with extension
    const files = await this.find(options.identifier, true);
    return files.length > 0 ? path.extname(files[0]).slice(1) : false;
  }

  /**
   * Find files by prefix in a directory
   */
  private async findByPrefix(
    directory: string,
    fileName: string
  ): Promise<string[]> {
    try {
      const fileNames = await fs.readdir(directory);
      const matches = fileNames.filter((potentialFileName) => {
        return potentialFileName.indexOf(fileName) === 0;
      });
      return matches;
    } catch (err) {
      return [];
    }
  }

  /**
   * Find configuration file(s)
   * @param filename - Filename to search for
   * @param asPrefix - If true, search for files starting with filename
   * @param callback - Optional callback
   * @returns Promise resolving to file path(s)
   */
  async find(filename: string, asPrefix?: false): Promise<string>;
  async find(filename: string, asPrefix: true): Promise<string[]>;
  async find(
    filename: string,
    asPrefix: boolean,
    callback: Callback<string | string[]>
  ): Promise<string | string[]>;
  async find(
    filename: string,
    asPrefix: boolean = false,
    callback?: Callback<string | string[]>
  ): Promise<string | string[]> {
    const searchPaths = this.options.files?.searchPaths || pathing.get();

    const promise = (async () => {
      const results = await Promise.allSettled(
        searchPaths.map(async (directory) => {
          const relativePath = path.join(directory, filename);
          const absolutePath = path.resolve(relativePath);

          if (asPrefix) {
            const absoluteDirectoryPath = path.resolve(directory);
            const matches = await this.findByPrefix(
              absoluteDirectoryPath,
              filename
            );
            return matches.map((match) =>
              path.join(absoluteDirectoryPath, match)
            );
          } else {
            try {
              await fs.access(absolutePath);
              return absolutePath;
            } catch {
              throw new Error(`File not found: ${absolutePath}`);
            }
          }
        })
      );

      const found = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<string | string[]>).value);

      if (asPrefix) {
        const matches = found.flat().filter(Boolean);
        if (matches.length) {
          return matches as string[];
        }
      } else {
        const match = found[0];
        if (match) {
          return match as string;
        }
      }

      throw new Error(`No files found matching: ${filename}`);
    })();

    return adaptToCallback(promise, callback);
  }

  /**
   * Get file contents
   */
  async get(filename: string): Promise<LoadResult>;
  async get(
    filename: string,
    callback: Callback<LoadResult>
  ): Promise<LoadResult>;
  async get(
    filename: string,
    callback?: Callback<LoadResult>
  ): Promise<LoadResult> {
    const promise = (async () => {
      const content = await fs.readFile(filename, 'utf-8');
      return {
        source: filename,
        content,
      };
    })();

    return adaptToCallback(promise, callback);
  }

  /**
   * Get change handler for file watching
   */
  private getChangeHandler(filename: string): (event: string) => void {
    return (event: string) => {
      this.emit(event, filename);
      this.get(filename)
        .then((result) => this.updated(null, result))
        .catch((err) => this.updated(err));
    };
  }

  /**
   * Watch a file for changes
   */
  watch(filename: string): void {
    const options = {
      persistent: false,
    };

    fsSync.watch(filename, options, this.getChangeHandler(filename));
  }

  /**
   * Load configuration from file
   */
  async load(requestedFilename: string): Promise<LoadResult>;
  async load(
    requestedFilename: string,
    callback: Callback<LoadResult>
  ): Promise<LoadResult>;
  async load(
    requestedFilename: string,
    callback?: Callback<LoadResult>
  ): Promise<LoadResult> {
    const promise = (async () => {
      const baseName = path.basename(requestedFilename);
      const dotIndex = baseName.lastIndexOf('.');
      const shouldDetermineFormat = dotIndex === -1;

      let filename: string;
      if (shouldDetermineFormat) {
        const files = await this.find(requestedFilename, true);
        filename = files[0];
      } else {
        filename = await this.find(requestedFilename, false);
      }

      const result = await this.get(filename);

      if (this.options.files?.watch) {
        this.watch(filename);
      }

      return result;
    })();

    return adaptToCallback(promise, callback);
  }
}
