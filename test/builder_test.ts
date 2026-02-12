import './helpers';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ConfigBuilder,
  TypedConfig,
  MemorySource,
  FileSource,
  OptionalFileSource,
  EnvSource,
  deepMerge,
} from '../src/builder';

describe('deepMerge', () => {
  it('merges flat objects', () => {
    const base = { a: 1, b: 2 };
    const override = { b: 3, c: 4 };
    const result = deepMerge(base, override);
    expect(result).to.deep.equal({ a: 1, b: 3, c: 4 });
  });

  it('deep merges nested objects', () => {
    const base = {
      database: { host: 'localhost', port: 5432 },
      debug: true,
    };
    const override = {
      database: { host: 'production.example.com' },
      timeout: 30,
    };
    const result = deepMerge(base, override);
    expect(result).to.deep.equal({
      database: { host: 'production.example.com', port: 5432 },
      debug: true,
      timeout: 30,
    });
  });

  it('replaces non-object with object', () => {
    const base = { value: 'string' };
    const override = { value: { nested: true } };
    const result = deepMerge(base, override);
    expect(result).to.deep.equal({ value: { nested: true } });
  });

  it('replaces object with non-object', () => {
    const base = { value: { nested: true } };
    const override = { value: 'string now' };
    const result = deepMerge(base, override);
    expect(result).to.deep.equal({ value: 'string now' });
  });

  it('handles arrays by replacement', () => {
    const base = { items: [1, 2, 3] };
    const override = { items: [4, 5] };
    const result = deepMerge(base, override);
    expect(result).to.deep.equal({ items: [4, 5] });
  });

  it('handles null values', () => {
    const base = { value: { nested: true } };
    const override = { value: null };
    const result = deepMerge(base, override);
    expect(result).to.deep.equal({ value: null });
  });

  it('does not mutate original objects', () => {
    const base = { a: 1, nested: { b: 2 } };
    const override = { nested: { c: 3 } };
    deepMerge(base, override);
    expect(base).to.deep.equal({ a: 1, nested: { b: 2 } });
    expect(override).to.deep.equal({ nested: { c: 3 } });
  });
});

describe('TypedConfig', () => {
  interface TestConfig {
    host: string;
    port: number;
    database: {
      host: string;
      port: number;
      ssl: boolean;
    };
    features: string[];
  }

  let config: TypedConfig<TestConfig>;

  beforeEach(() => {
    config = new TypedConfig<TestConfig>({
      host: 'localhost',
      port: 8080,
      database: {
        host: 'db.example.com',
        port: 5432,
        ssl: true,
      },
      features: ['auth', 'logging'],
    });
  });

  describe('#get', () => {
    it('gets top-level values', () => {
      expect(config.get('host')).to.equal('localhost');
      expect(config.get('port')).to.equal(8080);
    });

    it('gets nested values with dot notation', () => {
      expect(config.get('database.host')).to.equal('db.example.com');
      expect(config.get('database.port')).to.equal(5432);
      expect(config.get('database.ssl')).to.equal(true);
    });

    it('returns undefined for non-existent paths', () => {
      expect(config.get('nonexistent')).to.be.undefined;
      expect(config.get('database.nonexistent')).to.be.undefined;
      expect(config.get('deeply.nested.path')).to.be.undefined;
    });

    it('handles null in path', () => {
      const nullConfig = new TypedConfig({ value: null });
      expect(nullConfig.get('value.nested')).to.be.undefined;
    });
  });

  describe('#getString', () => {
    it('returns string values', () => {
      expect(config.getString('host')).to.equal('localhost');
    });

    it('returns default for non-string values', () => {
      expect(config.getString('port', 'default')).to.equal('default');
    });

    it('returns undefined for missing values without default', () => {
      expect(config.getString('nonexistent')).to.be.undefined;
    });
  });

  describe('#getNumber', () => {
    it('returns number values', () => {
      expect(config.getNumber('port')).to.equal(8080);
    });

    it('parses string values', () => {
      const strConfig = new TypedConfig({ value: '42' });
      expect(strConfig.getNumber('value')).to.equal(42);
    });

    it('parses float values', () => {
      const strConfig = new TypedConfig({ value: '3.14' });
      expect(strConfig.getNumber('value')).to.equal(3.14);
    });

    it('returns default for invalid strings', () => {
      const strConfig = new TypedConfig({ value: 'not a number' });
      expect(strConfig.getNumber('value', 99)).to.equal(99);
    });

    it('returns undefined for missing values without default', () => {
      expect(config.getNumber('nonexistent')).to.be.undefined;
    });
  });

  describe('#getBoolean', () => {
    it('returns boolean values', () => {
      expect(config.getBoolean('database.ssl')).to.equal(true);
    });

    it('parses string "true"', () => {
      const strConfig = new TypedConfig({ value: 'true' });
      expect(strConfig.getBoolean('value')).to.equal(true);
    });

    it('parses string "false"', () => {
      const strConfig = new TypedConfig({ value: 'false' });
      expect(strConfig.getBoolean('value')).to.equal(false);
    });

    it('parses string "1" as true', () => {
      const strConfig = new TypedConfig({ value: '1' });
      expect(strConfig.getBoolean('value')).to.equal(true);
    });

    it('parses string "0" as false', () => {
      const strConfig = new TypedConfig({ value: '0' });
      expect(strConfig.getBoolean('value')).to.equal(false);
    });

    it('is case insensitive', () => {
      expect(new TypedConfig({ v: 'TRUE' }).getBoolean('v')).to.equal(true);
      expect(new TypedConfig({ v: 'False' }).getBoolean('v')).to.equal(false);
    });

    it('returns default for invalid strings', () => {
      const strConfig = new TypedConfig({ value: 'maybe' });
      expect(strConfig.getBoolean('value', true)).to.equal(true);
    });

    it('returns undefined for missing values without default', () => {
      expect(config.getBoolean('nonexistent')).to.be.undefined;
    });
  });

  describe('#has', () => {
    it('returns true for existing paths', () => {
      expect(config.has('host')).to.be.true;
      expect(config.has('database.host')).to.be.true;
    });

    it('returns false for non-existent paths', () => {
      expect(config.has('nonexistent')).to.be.false;
      expect(config.has('database.nonexistent')).to.be.false;
    });
  });

  describe('#all', () => {
    it('returns the entire config data', () => {
      const all = config.all();
      expect(all.host).to.equal('localhost');
      expect(all.database.host).to.equal('db.example.com');
    });
  });

  describe('#toConfigurator', () => {
    it('creates a Configurator instance', () => {
      const configurator = config.toConfigurator();
      expect(configurator).to.exist;
      expect(configurator.context).to.deep.equal(config.all());
    });
  });
});

describe('MemorySource', () => {
  it('loads data from memory', async () => {
    const source = new MemorySource({ key: 'value' });
    const data = await source.load();
    expect(data).to.deep.equal({ key: 'value' });
  });

  it('returns a copy to prevent mutation', async () => {
    const source = new MemorySource({ key: 'value' });
    const data1 = await source.load();
    data1.key = 'modified';
    const data2 = await source.load();
    expect(data2.key).to.equal('value');
  });
});

describe('FileSource', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prefer-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('loads data from a JSON file', async () => {
    const filePath = path.join(tmpDir, 'config.json');
    fs.writeFileSync(filePath, JSON.stringify({ name: 'from file' }));

    const source = new FileSource(filePath);
    const data = await source.load();
    expect(data.name).to.equal('from file');
  });

  it('throws error for missing required file', async () => {
    const source = new FileSource('/nonexistent/file.json');
    await expect(source.load()).to.eventually.be.rejected;
  });
});

describe('OptionalFileSource', () => {
  it('returns empty object for missing file', async () => {
    const source = new OptionalFileSource('/nonexistent/file.json');
    const data = await source.load();
    expect(data).to.deep.equal({});
  });
});

describe('EnvSource', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('loads prefixed environment variables', async () => {
    process.env.MYAPP__HOST = 'localhost';
    process.env.MYAPP__PORT = '8080';

    const source = new EnvSource('MYAPP');
    const data = await source.load();
    expect(data.host).to.equal('localhost');
    expect(data.port).to.equal('8080');
  });

  it('converts to nested structure', async () => {
    process.env.MYAPP__DATABASE__HOST = 'db.example.com';
    process.env.MYAPP__DATABASE__PORT = '5432';

    const source = new EnvSource('MYAPP');
    const data = await source.load();
    const database = data.database as Record<string, unknown>;
    expect(database.host).to.equal('db.example.com');
    expect(database.port).to.equal('5432');
  });

  it('supports custom separator', async () => {
    process.env['MYAPP-DB-HOST'] = 'localhost';

    const source = new EnvSource('MYAPP', '-');
    const data = await source.load();
    const db = data.db as Record<string, unknown>;
    expect(db.host).to.equal('localhost');
  });

  it('ignores non-prefixed variables', async () => {
    process.env.MYAPP__KEY = 'value';
    process.env.OTHER__KEY = 'ignored';

    const source = new EnvSource('MYAPP');
    const data = await source.load();
    expect(data.key).to.equal('value');
    expect(data.other).to.be.undefined;
  });

  it('handles case conversion', async () => {
    process.env.MYAPP__UPPER__CASE = 'value';

    const source = new EnvSource('MYAPP');
    const data = await source.load();
    const upper = data.upper as Record<string, unknown>;
    expect(upper.case).to.equal('value');
  });
});

describe('ConfigBuilder', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prefer-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe('#addDefaults', () => {
    it('adds default values', async () => {
      const config = await new ConfigBuilder()
        .addDefaults({ host: 'localhost', port: 8080 })
        .build();

      expect(config.get('host')).to.equal('localhost');
      expect(config.get('port')).to.equal(8080);
    });
  });

  describe('#addFile', () => {
    it('loads from a file', async () => {
      const filePath = path.join(tmpDir, 'config.json');
      fs.writeFileSync(filePath, JSON.stringify({ name: 'from file' }));

      const config = await new ConfigBuilder()
        .addDefaults({ name: 'default' })
        .addFile(filePath)
        .build();

      expect(config.get('name')).to.equal('from file');
    });

    it('deep merges file with defaults', async () => {
      const filePath = path.join(tmpDir, 'config.json');
      fs.writeFileSync(
        filePath,
        JSON.stringify({ database: { host: 'production' } })
      );

      const config = await new ConfigBuilder()
        .addDefaults({
          database: { host: 'localhost', port: 5432 },
        })
        .addFile(filePath)
        .build();

      expect(config.get('database.host')).to.equal('production');
      expect(config.get('database.port')).to.equal(5432);
    });
  });

  describe('#addOptionalFile', () => {
    it('silently skips missing files', async () => {
      const config = await new ConfigBuilder()
        .addDefaults({ name: 'default' })
        .addOptionalFile('/nonexistent/file.json')
        .build();

      expect(config.get('name')).to.equal('default');
    });
  });

  describe('#addEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('adds environment variables', async () => {
      process.env.TESTAPP__HOST = 'envhost';

      const config = await new ConfigBuilder()
        .addDefaults({ host: 'localhost' })
        .addEnv('TESTAPP')
        .build();

      expect(config.get('host')).to.equal('envhost');
    });

    it('supports custom separator', async () => {
      process.env['TESTAPP-DB-HOST'] = 'envhost';

      const config = await new ConfigBuilder()
        .addEnv('TESTAPP', '-')
        .build();

      expect(config.get('db.host')).to.equal('envhost');
    });
  });

  describe('#addSource', () => {
    it('adds custom sources', async () => {
      const customSource = {
        async load() {
          return { custom: 'value' };
        },
      };

      const config = await new ConfigBuilder()
        .addSource(customSource)
        .build();

      expect(config.get('custom')).to.equal('value');
    });
  });

  describe('#build', () => {
    it('merges multiple sources in order', async () => {
      const file1 = path.join(tmpDir, 'config1.json');
      const file2 = path.join(tmpDir, 'config2.json');
      fs.writeFileSync(file1, JSON.stringify({ a: 1, b: 1 }));
      fs.writeFileSync(file2, JSON.stringify({ b: 2, c: 2 }));

      const config = await new ConfigBuilder()
        .addDefaults({ a: 0, b: 0, c: 0, d: 0 })
        .addFile(file1)
        .addFile(file2)
        .build();

      expect(config.get('a')).to.equal(1); // from file1
      expect(config.get('b')).to.equal(2); // from file2 (override)
      expect(config.get('c')).to.equal(2); // from file2
      expect(config.get('d')).to.equal(0); // from defaults
    });
  });

  describe('#buildConfigurator', () => {
    it('returns a Configurator instance', async () => {
      const configurator = await new ConfigBuilder()
        .addDefaults({ key: 'value' })
        .buildConfigurator();

      expect(configurator.context).to.deep.equal({ key: 'value' });
    });
  });

  describe('typed usage', () => {
    interface AppConfig {
      server: {
        host: string;
        port: number;
      };
      database: {
        url: string;
      };
    }

    it('provides type-safe access', async () => {
      const config = await new ConfigBuilder<AppConfig>()
        .addDefaults({
          server: { host: 'localhost', port: 3000 },
          database: { url: 'postgres://localhost/dev' },
        })
        .build();

      // These should be type-safe
      const host: string = config.get('server.host') as string;
      const port: number = config.get('server.port') as number;

      expect(host).to.equal('localhost');
      expect(port).to.equal(3000);
    });
  });
});

describe('Security', () => {
  describe('prototype pollution protection', () => {
    it('prevents pollution in deepMerge', () => {
      const malicious = JSON.parse('{"__proto__": {"polluted": true}}');
      expect(() => deepMerge({}, malicious)).to.throw(
        'Prototype pollution attempt detected'
      );
    });

    it('prevents pollution via TypedConfig.get', () => {
      const config = new TypedConfig({ safe: 'value' });
      expect(() => config.get('__proto__.polluted')).to.throw(
        'Prototype pollution attempt detected'
      );
    });

    it('prevents pollution via constructor key', () => {
      const malicious = JSON.parse('{"constructor": {"polluted": true}}');
      expect(() => deepMerge({}, malicious)).to.throw(
        'Prototype pollution attempt detected'
      );
    });

    it('prevents pollution via prototype key', () => {
      const malicious = JSON.parse('{"prototype": {"polluted": true}}');
      expect(() => deepMerge({}, malicious)).to.throw(
        'Prototype pollution attempt detected'
      );
    });
  });
});
