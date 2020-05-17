chai = require 'chai'
sinon = require 'sinon'
sinonTest = require 'sinon-test'

chai.use require 'chai-as-promised'

Object.assign(global,
  expect: chai.expect
  sinon: sinon
  test: sinonTest sinon
)
