prefer = require './index'
yargs = require 'yargs'

winston = require 'winston'
chalk = require 'chalk'

_ = require 'lodash'


aliases =
  c: 'configuration'
  v: 'verbose'

yargs = yargs.alias alias, original for alias, original of aliases
{argv} = yargs


main = (err, configuration) ->
  for key, value of configuration
    keyText = chalk.white key
    valueText = chalk.magenta value
    winston.info key + '=' + value


configure = (err, configurator) ->
  throw err if err?

  sourceText = chalk.magenta configurator.options.results.source
  winston.info 'loading configuration from ' + sourceText
  configurator.get main


module.exports = ->
  configurationFileNames = [
    argv.configuration
    process.env.PREFER_CONFIGURATION_FILENAME
    'prefer.yml'
  ]

  configurationFileName = _.first _.filter configurationFileNames
  prefer.load configurationFileName, configure
