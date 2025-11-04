import { Loader } from '../../src/loaders/loader';

export class TestNoFormatterLoader extends Loader {
  async formatterRequired() {
    return false;
  }
  
  async load() {
    return { source: 'test', content: '{}' };
  }
}
