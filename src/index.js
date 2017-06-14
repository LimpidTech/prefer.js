module.exports.sum = function(...args: number[]): number {
  return args.reduce((total, current) => total + current, 0)
}
