import * as path from 'path';

/**
 * Provider configuration for formatters
 */
export interface FormatterProvider {
  provides: (potentials: string[]) => boolean[];
  module: string;
}

/**
 * Ensure a string starts with a dot
 */
function ensureDot(val: string): string {
  return val[0] !== '.' ? '.' + val : val;
}

/**
 * Create a provides function for a given file type
 */
function provides(type: string): (potentials: string[]) => boolean[] {
  const typeWithDot = ensureDot(type);

  return (potentials: string[]): boolean[] => {
    return potentials.map((potential) => {
      const potentialWithDot = ensureDot(potential);
      if (typeWithDot === potentialWithDot) {
        return true;
      }
      return typeWithDot === path.extname(potential);
    });
  };
}

/**
 * Default formatter providers
 */
export const defaultFormatters: FormatterProvider[] = [
  {
    provides: provides('json'),
    module: './formatters/json:JSONFormatter',
  },
  {
    provides: provides('yml'),
    module: './formatters/yaml:YAMLFormatter',
  },
  {
    provides: provides('yaml'),
    module: './formatters/yaml:YAMLFormatter',
  },
  {
    provides: provides('xml'),
    module: './formatters/xml:XMLFormatter',
  },
  {
    provides: provides('ini'),
    module: './formatters/ini:INIFormatter',
  },
  {
    provides: provides('json5'),
    module: './formatters/json5:JSON5Formatter',
  },
  {
    provides: provides('jsonc'),
    module: './formatters/json5:JSON5Formatter',
  },
];
