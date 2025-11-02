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
  });
});
