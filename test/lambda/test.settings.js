'use strict'

var testUtil = require('./util')

var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var _integrationId = '_integrationId'
var _connectorId = 'connector1'

describe('Lambda connector settings tests', function () {
  it('should fail with 422 for persistSettings error', function (done) {
    var extensionProperties = {
      diy: false,
      _connectorId: _connectorId,
      type: 'setting',
      function: 'persistSettings'
    }

    var options = {
      error: true,
      bearerToken: bearerToken,
      _integrationId: _integrationId
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      var expected = [{ code: 'Error', message: 'persistSettings' }]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })

  it('should pass after successfully executing persistSettings', function (done) {
    var extensionProperties = {
      diy: false,
      _connectorId: _connectorId,
      function: 'persistSettings',
      type: 'setting'
    }

    var options = {
      pending: {fieldOne: 'oldValue', fieldTwo: 'newValue'},
      bearerToken: bearerToken,
      _integrationId: _integrationId
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      data.StatusCode.should.equal(200)

      options.function = 'persistSettings'
      var body = JSON.parse(data.Payload)
      body.should.eql(options)

      done()
    })
  })

  it('should pass after successfully executing refreshMetadata', function (done) {
    var extensionProperties = {
      diy: false,
      _connectorId: _connectorId,
      function: 'refreshMetadata',
      type: 'setting'
    }

    var options = {
      key: 'value',
      bearerToken: bearerToken,
      _integrationId: _integrationId
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      data.StatusCode.should.equal(200)
      options.function = 'refreshMetadata'

      var body = JSON.parse(data.Payload)
      body.should.eql(options)

      done()
    })
  })
})
