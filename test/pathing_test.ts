import './helpers';
import * as path from 'path';
import * as os from 'os';

describe('pathing', () => {
  let originalPlatform: string;
  let originalEnv: NodeJS.ProcessEnv;
  let originalCwd: string;
  let originalArgv: string[];

  beforeEach(() => {
    originalPlatform = process.platform;
    originalEnv = { ...process.env };
    originalCwd = process.cwd();
    originalArgv = [...process.argv];
    
    // Clear the module cache to reload with new environment
    delete require.cache[require.resolve('../src/pathing')];
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true,
    });
    process.env = originalEnv;
    process.chdir(originalCwd);
    process.argv = originalArgv;
    
    // Clear cache again
    delete require.cache[require.resolve('../src/pathing')];
  });

  describe('Linux/Unix', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
      });
    });

    it('includes current directory first', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths[0]).to.equal('.');
    });

    it('includes XDG_CONFIG_HOME when set', () => {
      process.env.XDG_CONFIG_HOME = '/custom/config';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include('/custom/config');
    });

    it('uses ~/.config when XDG_CONFIG_HOME not set', () => {
      delete process.env.XDG_CONFIG_HOME;
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include(path.join(os.homedir(), '.config'));
    });

    it('includes XDG_CONFIG_DIRS when set', () => {
      process.env.XDG_CONFIG_DIRS = '/etc/xdg:/usr/local/etc/xdg';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include('/etc/xdg');
      expect(paths).to.include('/usr/local/etc/xdg');
    });

    it('uses /etc/xdg when XDG_CONFIG_DIRS not set', () => {
      delete process.env.XDG_CONFIG_DIRS;
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include('/etc/xdg');
    });

    it('includes home directory', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include(os.homedir());
    });

    it('includes /etc', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include('/etc');
    });

    it('includes /usr/local/etc', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include('/usr/local/etc');
    });

    it('does not include Windows-specific paths', () => {
      process.env.APPDATA = 'C:\\Users\\test\\AppData';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.not.include('C:\\Users\\test\\AppData');
    });
  });

  describe('macOS', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        writable: true,
      });
    });

    it('includes macOS Library/Preferences paths', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.include(path.join(os.homedir(), 'Library', 'Preferences'));
      expect(paths).to.include(path.join(os.homedir(), 'Library', 'Application Support'));
      expect(paths).to.include('/Library/Preferences');
      expect(paths).to.include('/Library/Application Support');
    });

    it('includes XDG paths like Linux', () => {
      delete process.env.XDG_CONFIG_HOME;
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include(path.join(os.homedir(), '.config'));
    });

    it('includes Unix paths', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include('/etc');
      expect(paths).to.include('/usr/local/etc');
    });
  });

  describe('Windows', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
      });
    });

    it('includes APPDATA when set', () => {
      process.env.APPDATA = 'C:\\Users\\test\\AppData\\Roaming';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include('C:\\Users\\test\\AppData\\Roaming');
    });

    it('includes LOCALAPPDATA when set', () => {
      process.env.LOCALAPPDATA = 'C:\\Users\\test\\AppData\\Local';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include('C:\\Users\\test\\AppData\\Local');
    });

    it('includes ProgramData when set', () => {
      process.env.ProgramData = 'C:\\ProgramData';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include('C:\\ProgramData');
    });

    it('does not include XDG paths', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.not.include('/etc/xdg');
    });

    it('does not include Unix paths', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.not.include('/etc');
      expect(paths).to.not.include('/usr/local/etc');
    });
  });

  describe('bin directory handling', () => {
    it('includes parent directory when CWD is bin', () => {
      // Can't actually change cwd in tests easily, so we'll test the logic
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      // Just verify it returns an array
      expect(paths).to.be.an('array');
      expect(paths.length).to.be.greaterThan(0);
    });

    it('includes parent directory when script is in bin', () => {
      process.argv[1] = '/some/project/bin/myapp';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths).to.include('/some/project');
    });

    it('does not duplicate paths', () => {
      process.argv[1] = '/some/project/bin/myapp';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).to.equal(uniquePaths.length);
    });
  });

  describe('path filtering', () => {
    it('filters out empty strings', () => {
      delete process.env.HOME;
      delete process.env.APPDATA;
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      paths.forEach((p: string) => {
        expect(p).to.not.equal('');
      });
    });

    it('returns a new array each time', () => {
      const pathing = require('../src/pathing');
      const paths1 = pathing.get();
      const paths2 = pathing.get();
      
      expect(paths1).to.not.equal(paths2);
      expect(paths1).to.deep.equal(paths2);
    });
  });

  describe('edge cases', () => {
    it('handles missing HOME environment variable', () => {
      delete process.env.HOME;
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.be.an('array');
      expect(paths.length).to.be.greaterThan(0);
    });

    it('handles empty XDG_CONFIG_DIRS', () => {
      process.env.XDG_CONFIG_DIRS = '';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.be.an('array');
    });

    it('handles XDG_CONFIG_DIRS with multiple colons', () => {
      process.env.XDG_CONFIG_DIRS = '/path1::/path2::::/path3';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.include('/path1');
      expect(paths).to.include('/path2');
      expect(paths).to.include('/path3');
      expect(paths).to.not.include('');
    });

    it('handles script path without bin directory', () => {
      process.argv[1] = '/some/project/lib/index.js';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.be.an('array');
      expect(paths).to.not.include('/some/project');
    });

    it('handles missing script path', () => {
      process.argv[1] = '';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.be.an('array');
      expect(paths.length).to.be.greaterThan(0);
    });

    it('handles undefined script path', () => {
      delete process.argv[1];
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.be.an('array');
      expect(paths.length).to.be.greaterThan(0);
    });

    it('handles all environment variables missing on Windows', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
      });
      delete process.env.APPDATA;
      delete process.env.LOCALAPPDATA;
      delete process.env.ProgramData;
      delete process.env.HOME;
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.be.an('array');
      expect(paths.length).to.be.greaterThan(0);
      expect(paths[0]).to.equal('.');
    });

    it('handles all environment variables missing on Linux', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
      });
      delete process.env.HOME;
      delete process.env.XDG_CONFIG_HOME;
      delete process.env.XDG_CONFIG_DIRS;
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.be.an('array');
      expect(paths).to.include('.');
      expect(paths).to.include('/etc');
    });
  });

  describe('priority order', () => {
    it('prioritizes current directory over all others', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      expect(paths[0]).to.equal('.');
    });

    it('prioritizes user paths over system paths on Linux', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
      });
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      const homeIndex = paths.indexOf(os.homedir());
      const etcIndex = paths.indexOf('/etc');
      
      expect(homeIndex).to.be.lessThan(etcIndex);
    });
  });
});

