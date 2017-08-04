/**
 * Return the sum of the arguments.
 * @param {...number} args - numbers to sum
 * @return {number}
 */
export function sum(...args: number[]): number {
  return args.reduce((total, current) => total + current, 0)
}
