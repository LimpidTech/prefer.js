_ = require 'lodash'
os = require 'os'
path = require 'path'


defaultPaths =
  top: ['.']
  bottom: [process.env.HOME]


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
    defaultPaths.top
    defaultPaths.mid
    defaultPaths.bottom
  ]


module.exports =
  get: -> _.clone standardPaths
