'use strict'

var testUtil = require('./util')

var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var _integrationId = '_integrationId'
var _connectorId = '9ce44f88a25272b6d9cbb430ebbcfcf1'

var genTests = (flat) => {
  describe('Connector settings tests', function () {
    before(function (done) {
      testUtil.createMockExtension(false, true, flat, done)
    })

    it('should fail with 422 for persistSettings error', function (done) {
      var extensionProperties = {
        diy: false,
        _connectorId: _connectorId,
        type: flat ? undefined : 'setting',
        function: 'persistSettings'
      }

      var options = {
        error: true,
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }

      testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
        var expected = [{ code: 'Error', message: 'persistSettings' }]
        testUtil.validateErrorsRetured(four0xErrors, expected)
        done()
      })
    })

    it('should pass after successfully executing persistSettings', function (done) {
      var extensionProperties = {
        diy: false,
        _connectorId: _connectorId,
        function: 'persistSettings',
        type: flat ? undefined : 'setting'
      }

      var options = {
        pending: { fieldOne: 'oldValue', fieldTwo: 'newValue' },
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }

      testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
        options.function = 'persistSettings'
        data.should.eql(options)

        done()
      })
    })

    it('should pass after successfully executing refreshMetadata', function (done) {
      var extensionProperties = {
        diy: false,
        _connectorId: _connectorId,
        function: 'refreshMetadata',
        type: flat ? undefined : 'setting'
      }

      var options = {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }

      testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
        options.function = 'refreshMetadata'
        data.should.eql(options)

        done()
      })
    })
  })
}
genTests(false)
genTests(true)
