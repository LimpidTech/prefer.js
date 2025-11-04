/**
 * Provider configuration for loaders
 */
export interface LoaderProvider {
  provides: (potentials: string[]) => boolean[];
  module: string;
}

const fileNamePattern = /^((file):\/\/)?((\/)?[^/?*:;{}\\])+$/;

/**
 * Create a provides function for a given pattern
 */
function provides(pattern: RegExp): (potentials: string[]) => boolean[] {
  return (potentials: string[]): boolean[] => {
    return potentials.map((potential) => pattern.test(potential));
  };
}

/**
 * Default loader providers
 */
export const defaultLoaders: LoaderProvider[] = [
  {
    provides: provides(fileNamePattern),
    module: './loaders/file_loader:FileLoader',
  },
];
