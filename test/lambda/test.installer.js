'use strict'

var testUtil = require('./util')

var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var _integrationId = '_integrationId'
var _connectorId = 'connector1'

describe('Lambda connector installer tests', function () {
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

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      data.StatusCode.should.equal(200)
      options.function = 'runInstallerSuccessStep'
      var body = JSON.parse(data.Payload)
      body.should.eql(options)

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

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      data.StatusCode.should.equal(200)
      options.function = 'connectorInstallerFunction'
      var body = JSON.parse(data.Payload)
      body.should.eql(options)

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

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      var expected = [{ code: 'Error', message: 'runInstallerErrorStep' }]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })
})
