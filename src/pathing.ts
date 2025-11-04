import * as os from 'os';
import * as path from 'path';

const platform = os.platform();

function getConfigPaths(): string[] {
  const paths: string[] = [];

  // Current working directory (highest priority)
  paths.push('.');

  // If CWD is a bin directory, also check parent
  const cwd = process.cwd();
  if (path.basename(cwd) === 'bin') {
    paths.push(path.dirname(cwd));
  }

  // If the binary itself is in a bin directory, check its parent
  const scriptPath = process.argv[1];
  if (scriptPath) {
    const scriptDir = path.dirname(scriptPath);
    if (path.basename(scriptDir) === 'bin') {
      const binParent = path.dirname(scriptDir);
      if (!paths.includes(binParent)) {
        paths.push(binParent);
      }
    }
  }

  // User home directory
  paths.push(os.homedir());

  // XDG Base Directory (Linux/Unix/macOS)
  if (platform !== 'win32') {
    const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
    paths.push(xdgConfigHome);
  }

  // Platform-specific user paths
  if (platform === 'win32') {
    // Windows user paths
    if (process.env.APPDATA) paths.push(process.env.APPDATA);
    if (process.env.LOCALAPPDATA) paths.push(process.env.LOCALAPPDATA);
  } else if (platform === 'darwin') {
    // macOS user paths
    paths.push(path.join(os.homedir(), 'Library', 'Preferences'));
    paths.push(path.join(os.homedir(), 'Library', 'Application Support'));
  }

  // XDG system-wide paths (before OS system paths)
  if (platform !== 'win32') {
    const xdgConfigDirs = process.env.XDG_CONFIG_DIRS || '/etc/xdg';
    paths.push(...xdgConfigDirs.split(':').filter(Boolean));
  }

  // Platform-specific system paths
  if (platform === 'win32') {
    // Windows system paths
    if (process.env.ProgramData) paths.push(process.env.ProgramData);
  } else if (platform === 'darwin') {
    // macOS system paths
    paths.push('/Library/Preferences');
    paths.push('/Library/Application Support');
  }

  // Unix-like system paths (Linux, macOS, BSD) - lowest priority
  if (platform !== 'win32') {
    paths.push('/etc');
    paths.push('/usr/local/etc');
  }

  return paths.filter(Boolean);
}

const standardPaths = getConfigPaths();

/**
 * Get standard configuration search paths.
 *
 * @remarks
 * Returns paths in priority order (highest to lowest):
 * - Current directory (.)
 * - XDG_CONFIG_HOME (~/.config on Linux/Unix)
 * - XDG_CONFIG_DIRS (/etc/xdg on Linux/Unix)
 * - User home directory
 * - Platform-specific app data directories
 * - System-wide configuration directories
 *
 * @returns Array of directory paths to search for configuration files
 *
 * @example
 * ```ts
 * import * as pathing from './pathing';
 *
 * const searchPaths = pathing.get();
 * // Returns: ['.', '~/.config', '/etc/xdg', '~', '/etc', '/usr/local/etc']
 * ```
 */
export function get(): string[] {
  return [...standardPaths];
}
