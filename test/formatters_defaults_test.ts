import './helpers';
import { defaultFormatters } from '../src/formatters/defaults';

describe('formatters/defaults', () => {
  it('matches extension without dot', () => {
    const jsonFormatter = defaultFormatters.find(f => f.module.includes('json:'))!;
    expect(jsonFormatter.provides(['json'])[0]).to.be.true;
  });

  it('matches extension with dot', () => {
    const ymlFormatter = defaultFormatters.find(f => 
      f.module.includes('yaml:') && f.provides(['yml'])[0]
    )!;
    expect(ymlFormatter.provides(['.yml'])[0]).to.be.true;
  });

  it('matches file path by extension', () => {
    const iniFormatter = defaultFormatters.find(f => f.module.includes('ini:'))!;
    expect(iniFormatter.provides(['config.ini'])[0]).to.be.true;
  });

  it('includes all expected formatters', () => {
    const modules = defaultFormatters.map(f => f.module);
    
    expect(modules).to.include.members([
      './formatters/json:JSONFormatter',
      './formatters/yaml:YAMLFormatter',
      './formatters/xml:XMLFormatter',
      './formatters/ini:INIFormatter',
      './formatters/json5:JSON5Formatter'
    ]);
  });
});
