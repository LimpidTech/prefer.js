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

    it('includes standard Unix paths', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths[0]).to.equal('.');
      expect(paths).to.include(os.homedir());
      expect(paths).to.include('/etc');
      expect(paths).to.include('/usr/local/etc');
    });

    it('handles XDG environment variables', () => {
      process.env.XDG_CONFIG_HOME = '/custom/config';
      process.env.XDG_CONFIG_DIRS = '/etc/xdg:/usr/local/etc/xdg';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.include('/custom/config');
      expect(paths).to.include('/etc/xdg');
      expect(paths).to.include('/usr/local/etc/xdg');
    });

    it('uses XDG defaults when not set', () => {
      delete process.env.XDG_CONFIG_HOME;
      delete process.env.XDG_CONFIG_DIRS;
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.include(path.join(os.homedir(), '.config'));
      expect(paths).to.include('/etc/xdg');
    });

    it('excludes Windows-specific paths', () => {
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

    it('includes macOS-specific and Unix paths', () => {
      delete process.env.XDG_CONFIG_HOME;
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.include(path.join(os.homedir(), 'Library', 'Preferences'));
      expect(paths).to.include(path.join(os.homedir(), 'Library', 'Application Support'));
      expect(paths).to.include('/Library/Preferences');
      expect(paths).to.include('/Library/Application Support');
      expect(paths).to.include(path.join(os.homedir(), '.config'));
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

    it('includes Windows-specific paths', () => {
      process.env.APPDATA = 'C:\\Users\\test\\AppData\\Roaming';
      process.env.LOCALAPPDATA = 'C:\\Users\\test\\AppData\\Local';
      process.env.ProgramData = 'C:\\ProgramData';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.include('C:\\Users\\test\\AppData\\Roaming');
      expect(paths).to.include('C:\\Users\\test\\AppData\\Local');
      expect(paths).to.include('C:\\ProgramData');
    });

    it('excludes Unix-specific paths', () => {
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.not.include('/etc/xdg');
      expect(paths).to.not.include('/etc');
      expect(paths).to.not.include('/usr/local/etc');
    });
  });

  describe('bin directory handling', () => {
    it('includes parent directory when CWD is bin', () => {
      const originalCwd = process.cwd();
      const binPath = path.join(originalCwd, 'bin');
      
      // Mock process.cwd to return a bin directory
      const originalCwdFn = process.cwd;
      process.cwd = () => binPath;
      
      delete require.cache[require.resolve('../src/pathing')];
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      // Restore
      process.cwd = originalCwdFn;
      
      expect(paths).to.include(originalCwd);
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
    it('handles XDG_CONFIG_DIRS with empty values', () => {
      process.env.XDG_CONFIG_DIRS = '/path1::/path2::::/path3';
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths).to.include('/path1');
      expect(paths).to.include('/path2');
      expect(paths).to.include('/path3');
      expect(paths).to.not.include('');
    });

    it('handles missing or empty script paths', () => {
      process.argv[1] = '/some/project/lib/index.js';
      delete require.cache[require.resolve('../src/pathing')];
      
      let pathing = require('../src/pathing');
      expect(pathing.get()).to.not.include('/some/project');
      
      process.argv[1] = '';
      delete require.cache[require.resolve('../src/pathing')];
      pathing = require('../src/pathing');
      expect(pathing.get()).to.be.an('array');
    });

    it('handles missing environment variables gracefully', () => {
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
      
      expect(paths).to.include('.');
      expect(paths).to.include('/etc');
    });
  });

  describe('priority order', () => {
    it('prioritizes paths correctly', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
      });
      delete require.cache[require.resolve('../src/pathing')];
      
      const pathing = require('../src/pathing');
      const paths = pathing.get();
      
      expect(paths[0]).to.equal('.');
      expect(paths.indexOf(os.homedir())).to.be.lessThan(paths.indexOf('/etc'));
    });
  });
});

