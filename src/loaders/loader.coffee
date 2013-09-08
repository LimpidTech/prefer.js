_ = require 'lodash'


class BaseLoader
  constructor: (options) ->
    @updateOptions options

  updateOptions: (options) ->
    _.extend @options, {}, options


module.exports = {BaseLoader}
