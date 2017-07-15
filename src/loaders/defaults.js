path = require 'path'
lodash = require 'lodash'


fileNamePattern = /^((file):\/\/)?((\/)?[^/?*:;{}\\])+$/


provides = (pattern) -> (potentials) ->
  lodash.map potentials, (potential) ->
    pattern.test potential


module.exports = [
    provides: provides fileNamePattern
    module: './loaders/file_loader:FileLoader'
  ,
]
