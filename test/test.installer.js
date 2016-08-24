'use strict'

var testUtil = require('./util')

var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var _integrationId = '_integrationId'
var _connectorId = '9ce44f88a25272b6d9cbb430ebbcfcf1'

describe('Connector installer tests', function () {
  before(function (done) {
    testUtil.createMockExtension(true, true, done)
  })

  it('should pass after successfully executing installer step', function (done) {
    var extensionProperties = {
      _connectorId: _connectorId,
      type: 'installer',
      function: 'runInstallerSuccessStep'
    }

    var options = {
      key1: 'value1',
      key2: 'value1',
      bearerToken: bearerToken,
      _integrationId: _integrationId
    }

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      options.function = 'runInstallerSuccessStep'
      data.should.eql(options)

      done()
    })
  })

  it('should call connectorInstallerFunction installer', function (done) {
    var extensionProperties = {
      _connectorId: _connectorId,
      type: 'installer',
      function: 'connectorInstallerFunction'
    }

    var options = {
      key: 'value',
      bearerToken: bearerToken,
      _integrationId: _integrationId
    }

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      options.function = 'connectorInstallerFunction'
      data.should.eql(options)

      done()
    })
  })

  it('should fail with 422 for installer error', function (done) {
    var extensionProperties = {
      _connectorId: _connectorId,
      type: 'installer',
      function: 'runInstallerErrorStep'
    }

    var options = {
      key: 'value',
      bearerToken: bearerToken,
      _integrationId: _integrationId
    }

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      var expected = [{ code: 'Error', message: 'runInstallerErrorStep' }]
      testUtil.validateErrorsRetured(four0xErrors, expected)
      done()
    })
  })
})
