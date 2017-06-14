module.exports.sum = function(...args: number[]): number {
  return args.reduce((total, number) => total + number, 0)
}
