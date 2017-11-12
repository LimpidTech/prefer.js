import JSONFormatter from '../src/formatters/json'

import { resolveModule } from '../src/util'

describe('resolveModule', function() {
  it('should let me import a module', () => {
    expect(resolveModule('./formatters/json')).toBe(JSONFormatter)
  })
})
