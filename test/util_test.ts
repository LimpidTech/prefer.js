import './helpers';
import { resolveModule, queryNestedKey, adaptToCallback } from '../src/util';

describe('util', () => {
  describe('resolveModule', () => {
    it('loads entire module without separator', () => {
      const result = resolveModule('lodash');
      expect(result).to.be.a('function');
    });

    it('loads specific export with separator', () => {
      const result = resolveModule('lodash:cloneDeep');
      expect(result).to.be.a('function');
    });

    it('uses custom separator', () => {
      const result = resolveModule('lodash#cloneDeep', '#');
      expect(result).to.be.a('function');
    });

    it('handles empty attribute name', () => {
      const result = resolveModule('lodash:');
      expect(result).to.be.undefined;
    });
  });

  describe('queryNestedKey', () => {
    const testObj = {
      level1: { level2: { level3: 'value' } },
      simple: 'test'
    };

    it('returns entire object when no key provided', () => {
      const result = queryNestedKey(testObj);
      expect(result).to.equal(testObj);
    });

    it('strips leading dots from key', () => {
      const result = queryNestedKey(testObj, '...simple');
      expect(result).to.equal('test');
    });

    it('traverses nested keys', () => {
      const result = queryNestedKey(testObj, 'level1.level2.level3');
      expect(result).to.equal('value');
    });

    it('returns undefined for missing keys', () => {
      const result = queryNestedKey(testObj, 'nonexistent.nested');
      expect(result).to.be.undefined;
    });

    it('stops at null values', () => {
      const result = queryNestedKey({ key: null as any }, 'key.nested');
      expect(result).to.be.null;
    });
  });

  describe('adaptToCallback', () => {
    it('returns promise when no callback provided', async () => {
      const result = await adaptToCallback(Promise.resolve('test'));
      expect(result).to.equal('test');
    });

    it('returns promise even with callback', () => {
      const result = adaptToCallback(Promise.resolve('test'), () => {});
      expect(result).to.be.instanceOf(Promise);
    });

    it('calls callback on success', (done) => {
      adaptToCallback(Promise.resolve('test'), (err, result) => {
        expect(err).to.be.null;
        expect(result).to.equal('test');
        done();
      });
    });

    it('calls callback on error', (done) => {
      adaptToCallback(Promise.reject(new Error('test error')), (err) => {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
  });
});
