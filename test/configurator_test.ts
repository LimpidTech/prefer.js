import './helpers';
import { Configurator } from '../src/configurator';
import { fixture } from './shortcuts';

describe('Configurator', () => {
  let fixtureString: string;
  let fixtureData: Record<string, unknown>;
  let state: Record<string, unknown>;
  let configurator: Configurator;

  beforeEach(() => {
    fixtureString = fixture('json');
    fixtureData = JSON.parse(fixtureString);
    state = {};
    configurator = new Configurator(fixtureData, state);
  });

  describe('#constructor', () => {
    it('sets #context to the provided context', () => {
      expect(configurator.context).to.equal(fixtureData);
    });

    it('sets #state to the provided state', () => {
      expect(configurator.state).to.equal(state);
    });
  });

  describe('#get', () => {
    it('provides an error when the provided key does not exist', async () => {
      await expect(configurator.get('imaginaryKey')).to.eventually.be.rejectedWith(
        'imaginaryKey does not exist in this configuration.'
      );
    });

    it('provides the entire context if no key is provided', async () => {
      const result = await configurator.get();
      expect(result).to.deep.equal(fixtureData);
    });

    it('provides data associated with the provided key', async () => {
      const result = await configurator.get('user');
      expect(result).to.equal('monokrome');
    });

    it('provides all data when no key is provided', async () => {
      const result = await configurator.get();
      expect(result).to.deep.equal(fixtureData);
    });

    it('supports callback style', (done) => {
      configurator.get('user', (err, result) => {
        expect(err).to.be.null;
        expect(result).to.equal('monokrome');
        done();
      });
    });

    it('supports callback style without key', (done) => {
      configurator.get((err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.equal(fixtureData);
        done();
      });
    });

    it('calls callback with error for non-existent key', (done) => {
      configurator.get('nonExistent', (err, result) => {
        expect(err).to.be.instanceOf(Error);
        expect(err?.message).to.include('does not exist');
        done();
      });
    });

    it('returns deep clone to prevent mutation', async () => {
      const result1 = await configurator.get();
      const result2 = await configurator.get();
      expect(result1).to.not.equal(result2);
      expect(result1).to.deep.equal(result2);
    });

    it('handles nested keys with dots', async () => {
      await configurator.set('level1.level2.level3', 'deep-value');
      const result = await configurator.get('level1.level2.level3');
      expect(result).to.equal('deep-value');
    });
  });

  describe('#set', () => {
    let initial: Record<string, unknown>;
    let newFixture: Record<string, unknown>;

    beforeEach(() => {
      initial = fixtureData;
      newFixture = {
        example: 'data',
      };
    });

    it('resolves an unchanged context without any key or value provided', async () => {
      const context = await configurator.set(() => {});
      expect(context).to.deep.equal(initial);
      expect(configurator.context).to.deep.equal(initial);
    });

    it('updates the context with the provided value', async () => {
      await configurator.set(newFixture);
      const context = await configurator.get();
      expect(context).to.deep.equal(newFixture);
    });

    it('updates a key in the context with the provided value', async () => {
      await configurator.set('fake.key.here', newFixture);
      const context = await configurator.get('fake.key.here');
      expect(context).to.deep.equal(newFixture);
    });

    it('creates intermediate objects when setting nested keys', async () => {
      await configurator.set('new.nested.deep.value', 'test');
      const result = await configurator.get('new.nested.deep.value');
      expect(result).to.equal('test');
    });

    it('overwrites non-object values when creating nested paths', async () => {
      await configurator.set('user', 'string-value');
      await configurator.set('user.nested', 'new-value');
      const result = await configurator.get('user.nested');
      expect(result).to.equal('new-value');
    });

    it('supports callback style for setting values', (done) => {
      configurator.set('test.key', 'value', (err, result) => {
        expect(err).to.be.null;
        expect(result).to.equal('value');
        done();
      });
    });

    it('supports callback style for replacing context', (done) => {
      configurator.set(newFixture, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.equal(newFixture);
        done();
      });
    });

    it('allows setting undefined values', async () => {
      await configurator.set('key', undefined);
      // Getting undefined values throws an error since they don't exist
      await expect(configurator.get('key')).to.eventually.be.rejectedWith(
        'key does not exist in this configuration'
      );
    });

    it('returns deep clone of set value', async () => {
      const obj = { nested: 'value' };
      const result = await configurator.set('test', obj);
      expect(result).to.not.equal(obj);
      expect(result).to.deep.equal(obj);
    });
  });

  describe('security', () => {
    describe('set() protection', () => {
      it('prevents prototype pollution via __proto__', async () => {
        await expect(
          configurator.set('__proto__.polluted', 'value')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('prevents prototype pollution via prototype', async () => {
        await expect(
          configurator.set('prototype.polluted', 'value')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('prevents prototype pollution via constructor', async () => {
        await expect(
          configurator.set('constructor.polluted', 'value')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('prevents nested prototype pollution with __proto__', async () => {
        await expect(
          configurator.set('safe.key.__proto__.polluted', 'value')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('prevents nested prototype pollution with prototype', async () => {
        await expect(
          configurator.set('safe.prototype.polluted', 'value')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('prevents nested prototype pollution with constructor', async () => {
        await expect(
          configurator.set('safe.constructor.polluted', 'value')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('allows safe keys that contain proto as substring', async () => {
        await configurator.set('myprototype', 'value');
        const result = await configurator.get('myprototype');
        expect(result).to.equal('value');
      });
    });

    describe('get() protection', () => {
      it('prevents reading via __proto__', async () => {
        await expect(
          configurator.get('__proto__.polluted')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('prevents reading via prototype', async () => {
        await expect(
          configurator.get('prototype.polluted')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('prevents reading via constructor', async () => {
        await expect(
          configurator.get('constructor.polluted')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('prevents nested reading with __proto__', async () => {
        await expect(
          configurator.get('safe.key.__proto__.polluted')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('prevents nested reading with prototype', async () => {
        await expect(
          configurator.get('safe.prototype.polluted')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });

      it('prevents nested reading with constructor', async () => {
        await expect(
          configurator.get('safe.constructor.polluted')
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
      });
    });

    describe('Object.create(null) protection', () => {
      it('creates intermediate objects without prototype', async () => {
        await configurator.set('new.nested.value', 'test');
        const intermediate = (configurator.context as any).new;
        expect(Object.getPrototypeOf(intermediate)).to.be.null;
      });

      it('nested intermediate objects have no prototype', async () => {
        await configurator.set('level1.level2.level3.value', 'test');
        const level1 = (configurator.context as any).level1;
        const level2 = level1.level2;
        const level3 = level2.level3;
        
        expect(Object.getPrototypeOf(level1)).to.be.null;
        expect(Object.getPrototypeOf(level2)).to.be.null;
        expect(Object.getPrototypeOf(level3)).to.be.null;
      });

      it('does not affect existing objects with prototypes', async () => {
        const existingObj = { existing: 'value' };
        await configurator.set('myobj', existingObj);
        const retrieved = await configurator.get('myobj');
        
        // The retrieved object should still work normally
        expect(retrieved).to.deep.equal(existingObj);
      });

      it('checkPrototypePollution is essential - Object.defineProperty alone is not enough', async () => {
        // This test verifies that checkPrototypePollution is NOT redundant
        // Object.defineProperty can still be used for prototype pollution without the check
        await expect(
          configurator.set('__proto__', { polluted: true })
        ).to.eventually.be.rejectedWith('Prototype pollution attempt detected');
        
        // Verify the pollution didn't happen
        expect((configurator.context as any).polluted).to.be.undefined;
      });
    });
  });
});
