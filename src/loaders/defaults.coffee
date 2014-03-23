path = require 'path'
_ = require 'lodash'

fileNamePattern = /^((file):\/\/)?((\/)?[^/?*:;{}\\])+$/


provides = (pattern) -> (potential) -> pattern.test potential


module.exports = [
    provides: provides fileNamePattern
    module: './loaders/file_loader:FileLoader'
  ,
]
