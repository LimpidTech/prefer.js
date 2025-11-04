import './helpers';
import { JSONFormatter } from '../src/formatters/json';
import { JSON5Formatter } from '../src/formatters/json5';
import { YAMLFormatter } from '../src/formatters/yaml';
import { INIFormatter } from '../src/formatters/ini';
import { XMLFormatter } from '../src/formatters/xml';
import * as shortcuts from './shortcuts';

const fixture = {
  user: 'monokrome',
  domains: ['monokro.me', 'audalysis.com'],
};

const withNormalization = (promise: Promise<string>): Promise<string> => {
  return promise.then(shortcuts.normalize);
};

describe('JSONFormatter', () => {
  let asString: string;

  beforeEach(() => {
    asString = shortcuts.fixture('json');
  });

  describe('#parse', () => {
    it('converts the provided string to an object', async () => {
      const formatter = new JSONFormatter();
      const result = await formatter.parse(asString);
      expect(result).to.deep.equal(fixture);
    });

    it('provides an error when parsing fails', async () => {
      const formatter = new JSONFormatter();
      await expect(formatter.parse('invalid json')).to.eventually.be.rejected;
    });

    it('supports callback style', (done) => {
      const formatter = new JSONFormatter();
      formatter.parse(asString, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.equal(fixture);
        done();
      });
    });

    it('calls callback with error on parse failure', (done) => {
      const formatter = new JSONFormatter();
      formatter.parse('invalid json', (err, result) => {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
  });

  describe('#stringify', () => {
    it('converts the provided object into a JSON string', async () => {
      const formatter = new JSONFormatter();
      const result = await formatter.stringify(fixture);
      const parsed = JSON.parse(result);
      expect(parsed).to.deep.equal(fixture);
    });

    it('supports callback style', (done) => {
      const formatter = new JSONFormatter();
      formatter.stringify(fixture, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.be.a('string');
        done();
      });
    });
  });
});

describe('YAMLFormatter', () => {
  let asString: string;

  beforeEach(() => {
    asString = shortcuts.fixture('yml');
  });

  describe('#parse', () => {
    it('converts the provided string to an object', async () => {
      const formatter = new YAMLFormatter();
      const result = await formatter.parse(asString);
      expect(result).to.deep.equal(fixture);
    });

    it('provides an error when parsing invalid YAML', async () => {
      const formatter = new YAMLFormatter();
      const invalidYaml = 'key: [unclosed array';
      await expect(formatter.parse(invalidYaml)).to.eventually.be.rejected;
    });

    it('supports callback style', (done) => {
      const formatter = new YAMLFormatter();
      formatter.parse(asString, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.equal(fixture);
        done();
      });
    });
  });

  describe('#stringify', () => {
    it('converts the provided object into a YAML string', async () => {
      const formatter = new YAMLFormatter();
      const result = await withNormalization(formatter.stringify(fixture));
      expect(result).to.equal(shortcuts.normalize(asString));
    });

    it('supports callback style', (done) => {
      const formatter = new YAMLFormatter();
      formatter.stringify(fixture, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.be.a('string');
        done();
      });
    });
  });
});

describe('INIFormatter', () => {
  let asString: string;

  beforeEach(() => {
    asString = shortcuts.fixture('ini');
  });

  describe('#parse', () => {
    it('converts the provided string to an object', async () => {
      const formatter = new INIFormatter();
      const result = await formatter.parse(asString);
      expect(result).to.deep.equal(fixture);
    });

    it('supports callback style', (done) => {
      const formatter = new INIFormatter();
      formatter.parse(asString, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.equal(fixture);
        done();
      });
    });
  });

  describe('#stringify', () => {
    it('converts the provided object into an INI string', async () => {
      const formatter = new INIFormatter();
      const result = await withNormalization(formatter.stringify(fixture));
      expect(result).to.equal(shortcuts.normalize(asString));
    });

    it('supports callback style', (done) => {
      const formatter = new INIFormatter();
      formatter.stringify(fixture, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.be.a('string');
        done();
      });
    });
  });
});

describe('XMLFormatter', () => {
  let asString: string;

  beforeEach(() => {
    asString = shortcuts.fixture('xml');
  });

  describe('#parse', () => {
    it('converts the provided string to an object', async () => {
      const formatter = new XMLFormatter();
      const result = await formatter.parse(asString);
      expect(result).to.deep.equal(fixture);
    });

    it('provides an error when parsing invalid XML', async () => {
      const formatter = new XMLFormatter();
      const invalidXml = '<root><unclosed>';
      await expect(formatter.parse(invalidXml)).to.eventually.be.rejected;
    });

    it('supports callback style', (done) => {
      const formatter = new XMLFormatter();
      formatter.parse(asString, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.equal(fixture);
        done();
      });
    });
  });

  describe('#stringify', () => {
    it('converts the provided object into an XML string', async () => {
      const formatter = new XMLFormatter();
      const result = await formatter.stringify(fixture);
      expect(result).to.be.a('string');
      expect(result).to.include('<user>monokrome</user>');
    });

    it('supports callback style', (done) => {
      const formatter = new XMLFormatter();
      formatter.stringify(fixture, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.be.a('string');
        done();
      });
    });
  });
});

describe('JSON5Formatter', () => {
  let asString: string;

  beforeEach(() => {
    asString = shortcuts.fixture('json5');
  });

  describe('#parse', () => {
    it('converts the provided string to an object', async () => {
      const formatter = new JSON5Formatter();
      const result = await formatter.parse(asString);
      expect(result).to.deep.equal(fixture);
    });

    it('supports comments in JSON5', async () => {
      const formatter = new JSON5Formatter();
      const json5WithComments = `{
        // This is a comment
        user: 'monokrome',
        /* Multi-line
           comment */
        domains: ['monokro.me', 'audalysis.com']
      }`;
      const result = await formatter.parse(json5WithComments);
      expect(result).to.deep.equal(fixture);
    });

    it('provides an error when parsing invalid JSON5', async () => {
      const formatter = new JSON5Formatter();
      const invalidJson5 = '{user: invalid syntax here}';
      await expect(formatter.parse(invalidJson5)).to.eventually.be.rejected;
    });

    it('supports callback style', (done) => {
      const formatter = new JSON5Formatter();
      formatter.parse(asString, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.equal(fixture);
        done();
      });
    });
  });

  describe('#stringify', () => {
    it('converts the provided object into a JSON5 string', async () => {
      const formatter = new JSON5Formatter();
      const result = await formatter.stringify(fixture);
      const parsed = JSON5Formatter.prototype['fromString'](result);
      expect(await parsed).to.deep.equal(fixture);
    });

    it('supports callback style', (done) => {
      const formatter = new JSON5Formatter();
      formatter.stringify(fixture, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.be.a('string');
        done();
      });
    });
  });
});
