_ = require 'lodash'
os = require 'os'
path = require 'path'


platform = os.platform()


lastPaths =
  win32: [
    process.env.USERPROFILE

    process.env.LOCALPROFILE
    process.env.APPDATA

    process.env.CommonProgramFiles
    process.env.ProgramData
    process.env.ProgramFiles
    process.env['ProgramFiles(x86)']

    process.env.SystemRoot
    process.env.SystemRoot + '/system32'
  ]

  default: [
    process.env.HOME
    '/'
  ]

conventionalize = (subject, parent=[]) ->
  if _.isString subject
    return parent.concat [
      path.join subject, 'etc'
      path.join subject, '.config'
      subject
    ]

  else if _.isArray subject
    for item in subject
      parent = parent.concat conventionalize item

  return parent


standardPaths = conventionalize [
    '.'

    lastPaths[platform] or lastPaths.default
  ]


module.exports =
  get: -> _.clone standardPaths
