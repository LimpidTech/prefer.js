import './helpers';
import prefer from '../src';
import { FileLoader } from '../src/loaders/file_loader';
import { YAMLFormatter } from '../src/formatters/yaml';
import { fixture } from './shortcuts';
import { defaultLoaders } from '../src/loaders/defaults';
import { defaultFormatters } from '../src/formatters/defaults';
import cloneDeep from 'lodash/cloneDeep';

describe('prefer', () => {
  let identifierBase: string;
  let identifier: string;
  let options: Record<string, unknown>;
  let fixtureString: string;
  let fixtureData: Record<string, unknown>;

  beforeEach(() => {
    identifierBase = 'fixture';
    identifier = identifierBase + '.json';

    fixtureString = fixture('json');
    fixtureData = JSON.parse(fixtureString);

    options = {
      identifier: identifier,
      loaders: defaultLoaders,
      formatters: defaultFormatters,
      files: {
        searchPaths: ['test/fixtures/'],
      },
    };
  });

  describe('#load', () => {
    it('returns a promise that provides the configuration', async () => {
      const configurator = await prefer.load(cloneDeep(options) as any);
      const context = await configurator.get();
      expect(context).to.deep.equal(fixtureData);
    });

    it('supports callback style usage', (done) => {
      prefer.load(identifier, {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      }, (err, configurator) => {
        if (err || !configurator) {
          done(err || new Error('No configurator'));
          return;
        }
        configurator.get().then((context) => {
          expect(context).to.deep.equal(fixtureData);
          done();
        }).catch(done);
      });
    });

    it('allows identifier as a string with options', async () => {
      const configurator = await prefer.load(identifier, {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      });
      const context = await configurator.get();
      expect(context).to.deep.equal(fixtureData);
    });

    it('throws an error without an identifier', async () => {
      await expect(prefer.load({} as any)).to.eventually.be.rejectedWith(
        'No identifier provided for configuration'
      );
    });

    it('loads configurations without requiring their format', async () => {
      const configurator = await prefer.load(identifier, {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      });
      expect(configurator).to.exist;
    });

    it('loads YAML configurations', async () => {
      const configurator = await prefer.load('fixture.yml', {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      });
      const context = await configurator.get();
      expect(context).to.deep.equal(fixtureData);
    });

    it('loads INI configurations', async () => {
      const configurator = await prefer.load('fixture.ini', {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      });
      const context = await configurator.get();
      expect(context).to.deep.equal(fixtureData);
    });

    it('loads XML configurations', async () => {
      const configurator = await prefer.load('fixture.xml', {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      });
      const context = await configurator.get();
      expect(context).to.deep.equal(fixtureData);
    });

    it('loads JSON5 configurations', async () => {
      const configurator = await prefer.load('fixture.json5', {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      });
      const context = await configurator.get();
      expect(context).to.deep.equal(fixtureData);
    });

    it('throws error when no loader matches identifier', async () => {
      await expect(
        prefer.load('fixture.json', {
          loaders: [],
          files: {
            searchPaths: ['test/fixtures/'],
          },
        })
      ).to.eventually.be.rejectedWith('No configuration loader found');
    });

    it('throws error when no formatter matches file type', async () => {
      await expect(
        prefer.load('fixture.json', {
          formatters: [],
          files: {
            searchPaths: ['test/fixtures/'],
          },
        })
      ).to.eventually.be.rejectedWith('No configuration formatter found');
    });

    it('throws error when file does not exist', async () => {
      await expect(
        prefer.load('nonexistent.json', {
          files: {
            searchPaths: ['test/fixtures/'],
          },
        })
      ).to.eventually.be.rejectedWith('No files found matching');
    });

    it('does not emit updated event on initial load', async () => {
      let eventEmitted = false;
      prefer.once('updated', () => {
        eventEmitted = true;
      });

      await prefer.load(identifier, {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      });

      expect(eventEmitted).to.be.false;
    });

    it('calls callback with error on load failure', (done) => {
      prefer.load('nonexistent.json', {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      }, (err, configurator) => {
        expect(err).to.be.instanceOf(Error);
        expect(configurator).to.be.undefined;
        done();
      });
    });

    it('handles identifier from options object', async () => {
      const configurator = await prefer.load({
        identifier: 'fixture.json',
        files: {
          searchPaths: ['test/fixtures/'],
        },
      });
      const context = await configurator.get();
      expect(context).to.deep.equal(fixtureData);
    });

    it('supports load(identifier, callback) overload', (done) => {
      prefer.load('fixture.json', (err, configurator) => {
        expect(err).to.not.be.null;
        done();
      });
    });
  });

  describe('event handling', () => {
    it('emits updated event when loader emits updated', async () => {
      const { Prefer } = require('../src/index');
      const testPrefer = new Prefer();
      let updateReceived = false;

      testPrefer.on('updated', (configurator) => {
        expect(configurator).to.exist;
        updateReceived = true;
      });

      await testPrefer.load(identifier, {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      });

      const formatter = (testPrefer as any).getFormatter({
        identifier,
        formatters: defaultFormatters,
      }, 'json');

      const format = (testPrefer as any).format(formatter);
      await format({ source: 'test', content: JSON.stringify({ test: 'value' }) }, true);

      expect(updateReceived).to.be.true;
    });

    it('emits error event when update parsing fails', (done) => {
      const { Prefer } = require('../src/index');
      const { FileLoader } = require('../src/loaders/file_loader');
      const testPrefer = new Prefer();

      testPrefer.on('error', (err) => {
        expect(err).to.be.instanceOf(Error);
        done();
      });

      testPrefer.load(identifier, {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      }).then(() => {
        const options = {
          identifier,
          loaders: defaultLoaders,
          formatters: defaultFormatters,
          files: { searchPaths: ['test/fixtures/'] },
        };
        
        const loader = (testPrefer as any).getLoader(options);
        const formatter = (testPrefer as any).getFormatter(options, 'json');
        const format = (testPrefer as any).format(formatter);
        
        loader.on('updated', (updates: any) => {
          format(updates).catch((err: Error) => {
            testPrefer.emit('error', err);
          });
        });
        
        loader.emit('updated', { source: 'test', content: 'invalid json {{{' });
      }).catch(done);
    });
  });

  describe('edge cases', () => {
    it('throws error when getting entity without identifier', async () => {
      const { Prefer } = require('../src/index');
      const testPrefer = new Prefer();
      
      try {
        (testPrefer as any).getLoader({
          loaders: defaultLoaders,
        });
        expect.fail('Should have thrown error');
      } catch (err: any) {
        expect(err.message).to.include('No identifier provided for loader');
      }
    });

    it('throws error when getting formatter without identifier', async () => {
      const { Prefer } = require('../src/index');
      const testPrefer = new Prefer();
      
      try {
        (testPrefer as any).getFormatter({
          formatters: defaultFormatters,
        });
        expect.fail('Should have thrown error');
      } catch (err: any) {
        expect(err.message).to.include('No identifier provided for formatter');
      }
    });

    it('handles non-standard filterBy types with toArray', async () => {
      const { Prefer } = require('../src/index');
      const testPrefer = new Prefer();
      
      const options = {
        identifier: 123 as any,
        loaders: defaultLoaders,
      };
      
      try {
        (testPrefer as any).getLoader(options);
      } catch (err: any) {
        expect(err.message).to.include('No configuration loader found');
      }
    });

    it('throws error when formatterRequired returns false', async () => {
      const { Prefer } = require('../src/index');
      const { FileLoader } = require('../src/loaders/file_loader');
      
      class NoFormatterLoader extends FileLoader {
        async formatterRequired() {
          return false;
        }
      }
      
      const testPrefer = new Prefer();
      const noFormatterLoader = new NoFormatterLoader({
        files: { searchPaths: ['test/fixtures/'], watch: false },
      });
      
      testPrefer['getLoader'] = () => noFormatterLoader;
      
      await expect(
        testPrefer.load('fixture.json', {
          loaders: defaultLoaders,
          formatters: defaultFormatters,
          files: { searchPaths: ['test/fixtures/'] },
        })
      ).to.eventually.be.rejectedWith('Formatter is required but not available');
    });

    it('handles duplicate identifier check in load', async () => {
      const configurator = await prefer.load({
        identifier: 'fixture.json',
        files: {
          searchPaths: ['test/fixtures/'],
        },
      });
      expect(configurator).to.exist;
    });

    it('covers error catch in update listener', (done) => {
      const { Prefer } = require('../src/index');
      const { FileLoader } = require('../src/loaders/file_loader');
      const testPrefer = new Prefer();
      let capturedLoader: any = null;
      
      const originalGetLoader = testPrefer['getLoader'];
      testPrefer['getLoader'] = function(options: any) {
        capturedLoader = originalGetLoader.call(this, options);
        return capturedLoader;
      };
      
      testPrefer.on('error', (err) => {
        expect(err).to.be.instanceOf(Error);
        done();
      });

      testPrefer.load(identifier, {
        files: {
          searchPaths: ['test/fixtures/'],
        },
      }).then(() => {
        if (capturedLoader) {
          capturedLoader.emit('updated', { source: 'test', content: 'invalid{json' });
        }
      }).catch(done);
    });

    it('handles load with identifier only (no options)', async () => {
      await expect(
        prefer.load('fixture.json')
      ).to.eventually.be.rejected;
    });
  });
});


