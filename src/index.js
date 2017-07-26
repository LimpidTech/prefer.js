export function sum(...args: number[]): number {
  return args.reduce((total, current) => total + current, 0)
}
