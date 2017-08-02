import { sum } from './index'

describe('Proto ES2017+', function() {
  test('#sum should add 1, 2, 3, and 4 to equal 10', () => {
    expect(sum(1, 2, 3, 4)).toBe(10)
  })
})
