import fs from 'fs'

export function normalize(asString) {
  if (asString[asString.length - 1] === '\n')
    asString = asString.substring(0, asString.length - 1)

  return asString
}

export function fixture(ext) {
  const contents = fs.readFileSync(`test/fixtures/fixture.${ext}`)
  return normalize(contents.toString())
}
