import './helpers';
import { Loader } from '../src/loaders/loader';
import { FileLoader } from '../src/loaders/file_loader';
import * as path from 'path';
import { fixture } from './shortcuts';

const loaders = {
  fixture: JSON.parse(fixture('json')),
};

describe('Loader', () => {
  let loader: Loader;

  beforeEach(() => {
    loader = new Loader();
  });

  describe('#updated', () => {
    it('should emit "updated" without error', (done) => {
      loader.on('updated', () => {
        done();
      });
      loader.updated(null, { source: 'test', content: 'test' });
    });

    it('should emit "updateFailed" with an error', (done) => {
      loader.on('updateFailed', (err) => {
        expect(err).to.be.instanceOf(Error);
        done();
      });
      loader.updated(new Error('Fake error'));
    });
  });

  describe('#formatterRequired', () => {
    it('should default to true', async () => {
      const result = await loader.formatterRequired({});
      expect(result).to.be.true;
    });
  });

  describe('#formatterSuggested', () => {
    it('should not suggest formatters by default', async () => {
      const result = await loader.formatterSuggested({});
      expect(result).to.equal(false);
    });
  });
});

describe('FileLoader', () => {
  let fixturesPath: string;
  let identifierBase: string;
  let identifier: string;
  let loader: FileLoader;

  beforeEach(() => {
    fixturesPath = path.resolve('test/fixtures');
    identifierBase = 'fixture';
    identifier = identifierBase + '.json';

    loader = new FileLoader({
      files: {
        watch: false,
        searchPaths: ['test/fixtures/'],
      },
    });
  });

  describe('#load', () => {
    it('results in a not found error if no file was found', async () => {
      await expect(loader.load('fakeFile')).to.eventually.be.rejectedWith(
        'No files found matching: fakeFile'
      );
    });

    it('loads a valid file successfully', async () => {
      const result = await loader.load('fixture.json');
      expect(result).to.have.property('source');
      expect(result).to.have.property('content');
      expect(result.content).to.be.a('string');
    });

    it('handles empty search paths', async () => {
      const emptyLoader = new FileLoader({
        files: {
          watch: false,
          searchPaths: [],
        },
      });
      await expect(emptyLoader.load('fixture.json')).to.eventually.be.rejectedWith(
        'No files found matching'
      );
    });

    it('handles non-existent search paths', async () => {
      const badLoader = new FileLoader({
        files: {
          watch: false,
          searchPaths: ['/non/existent/path/'],
        },
      });
      await expect(badLoader.load('fixture.json')).to.eventually.be.rejectedWith(
        'No files found matching'
      );
    });
  });

  describe('#formatterRequired', () => {
    it('should always result as true', async () => {
      const result = await loader.formatterRequired({});
      expect(result).to.be.true;
    });
  });

  describe('#formatterSuggested', () => {
    it("should suggest a formatter using its file extension", async () => {
      const result = await loader.formatterSuggested({
        identifier: identifier,
      });
      expect(result).to.equal('json');
    });

    it('should find possible configurations when no extension is provided', async () => {
      const result = await loader.formatterSuggested({
        identifier: identifierBase,
      });
      expect(result).to.be.oneOf(['json', 'yml', 'xml', 'ini', 'json5', 'fake']);
    });

    it('returns false when no identifier provided', async () => {
      const result = await loader.formatterSuggested({});
      expect(result).to.equal(false);
    });
  });

  describe('#find', () => {
    it('finds a file with exact name', async () => {
      const result = await loader.find('fixture.json', false);
      expect(result).to.be.a('string');
      expect(result).to.include('fixture.json');
    });

    it('finds files by prefix', async () => {
      const results = await loader.find('fixture', true);
      expect(results).to.be.an('array');
      expect(results.length).to.be.greaterThan(0);
    });

    it('throws error when no files match prefix', async () => {
      await expect(loader.find('nonexistent', true)).to.eventually.be.rejectedWith(
        'No files found matching'
      );
    });

    it('throws error when exact file not found', async () => {
      await expect(loader.find('nonexistent.json', false)).to.eventually.be.rejectedWith(
        'No files found matching'
      );
    });
  });

  describe('#get', () => {
    it('reads file contents', async () => {
      const files = await loader.find('fixture.json', false);
      const result = await loader.get(files);
      expect(result).to.have.property('source');
      expect(result).to.have.property('content');
      expect(result.content).to.be.a('string');
    });

    it('handles empty file path', async () => {
      await expect(loader.get('')).to.eventually.be.rejected;
    });

    it('handles non-existent file path', async () => {
      await expect(loader.get('/non/existent/file.json')).to.eventually.be.rejected;
    });

    it('supports callback style', (done) => {
      loader.find('fixture.json', false).then((file) => {
        loader.get(file, (err, result) => {
          expect(err).to.be.null;
          expect(result).to.have.property('source');
          expect(result).to.have.property('content');
          done();
        });
      }).catch(done);
    });
  });
});
