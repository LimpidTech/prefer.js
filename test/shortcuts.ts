import * as fs from 'fs';

export function normalize(asString: string): string {
  return asString.trim();
}

export function fixture(ext: string): string {
  const contents = fs.readFileSync(`test/fixtures/fixture.${ext}`);
  return contents.toString();
}
