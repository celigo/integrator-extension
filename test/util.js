var Extension = require('../lib/extension')
var testExtension = new Extension()
var testModules = require('./testModules')
var should = require('should')

exports.callFunction = function (options, extensionProperties, callback) {
  return testExtension.callFunction(options, extensionProperties, callback)
}

exports.createMockExtension = function (diy, connector, callback) {
  var config = {}
  config.diy = diy ? testModules.testModule : undefined
  var connectors = {
    '9ce44f88a25272b6d9cbb430ebbcfcf1': testModules.testModule,
    '6a4b9e817fb9f522dbd012f642855a03': testModules.testInstance
  }
  config.connectors = connector ? connectors : undefined
  testExtension.loadConfiguration(config, function (e) {
    return callback(e)
  })
}

exports.validateErrorsRetured = function (four0xErrors, expectedErrors) {
  should.exist(four0xErrors)
  four0xErrors.statusCode.should.equal(422)
  four0xErrors.errors.should.eql(expectedErrors)
}
