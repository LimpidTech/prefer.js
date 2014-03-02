path = require 'path'
_ = require 'lodash'

fileNamePattern = /^((file):\/\/)?((\/)?[^/?*:;{}\\])+$/


matches = (pattern) -> (potential) -> pattern.test potential


module.exports = [
    match: matches fileNamePattern
    module: './loaders/file_loader:FileLoader'
  ,
]
