import lodash from 'lodash'

const fileNamePattern = /^((file):\/\/)?((\/)?[^/?*:;{}\\])+$/

const provides = pattern => potentials =>
  lodash.map(potentials, potential => pattern.test(potential))

const module = './loaders/file_loader'

export default [
  {
    module,
    provides: provides(fileNamePattern),
  },
]
