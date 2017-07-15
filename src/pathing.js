import os from 'os'
import path from 'path'
import lodash from 'lodash'
import { argv } from 'optimist'

let localDirectory = path.dirname(argv.$0.split(' ').slice(1)[0])
if (localDirectory.slice(localDirectory.length - 4) === '/bin') {
  localDirectory = [
    localDirectory,
    localDirectory.slice(0, localDirectory.length - 3),
  ]
}

const lastPaths = {
  win32: [
    process.env.USERPROFILE,

    process.env.LOCALPROFILE,
    process.env.APPDATA,

    process.env.CommonProgramFiles,
    process.env.ProgramData,
    process.env.ProgramFiles,
    process.env['ProgramFiles(x86)'],

    process.env.SystemRoot,
    `${process.env.SystemRoot}/system32`,
  ],

  default: [process.env.HOME, '/usr/local', '/usr/', '/'],
}

function conventionalize(subject, parent = []) {
  if (lodash.isString(subject)) {
    return parent.concat([
      path.join(subject, 'etc'),
      path.join(subject, '.config'),
      subject,
    ])
  }

  if (lodash.isArray(subject)) {
    for (let item of subject) parent = parent.concat(conventionalize(item))
  }

  return parent
}

const standardPaths = conventionalize([
  '.',
  localDirectory,
  lastPaths[os.platform()] || lastPaths.default,
])

export default function() {
  return lodash.clone(standardPaths)
}
