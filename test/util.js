var AbstractExtension = require('../lib/abstractExtension')
var extension = new AbstractExtension()
var testModule = require('./testModule')
var should = require('should')

exports.callFunction = function (options, extensionProperties, callback) {
  return extension.callFunction(options, extensionProperties, callback)
}

exports.createMockExtension = function (diy, connector, callback) {
  extension.loadConfiguration({
    diy: diy ? testModule : undefined,
    connectors: {
      '9ce44f88a25272b6d9cbb430ebbcfcf1': connector ? testModule : undefined,
      '6a4b9e817fb9f522dbd012f642855a03': connector ? testModule : undefined
    }
  }, function (e) {
    return callback(e)
  })
}

exports.validateErrorsRetured = function (four0xErrors, expectedErrors) {
  should.exist(four0xErrors)
  four0xErrors.statusCode.should.equal(422)
  four0xErrors.errors.should.eql(expectedErrors)
}
