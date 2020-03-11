'use strict'

var testUtil = require('./util')

var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var _integrationId = '_integrationId'
var _connectorId = '9ce44f88a25272b6d9cbb430ebbcfcf1'

var genTests = (flat) => {
  describe('Connector utilities tests', function () {
    before(function (done) {
      testUtil.createMockExtension(false, true, flat, done)
    })

    it('should fail with 422 for myUtility error', function (done) {
      var extensionProperties = {
        diy: false,
        _connectorId: _connectorId,
        type: flat ? undefined : 'utility',
        function: 'myUtility'
      }

      var options = {
        error: true,
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }

      testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
        var expected = [{ code: 'Error', message: 'myUtility error' }]
        testUtil.validateErrorsRetured(four0xErrors, expected)
        done()
      })
    })

    it('should pass after successfully executing myUtility', function (done) {
      var extensionProperties = {
        diy: false,
        _connectorId: _connectorId,
        function: 'myUtility',
        type: flat ? undefined : 'utility'
      }

      var options = {
        a: 'b',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }

      testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
        options.function = 'myUtility'
        data.should.eql(options)

        done()
      })
    })
  })
}
genTests(false)
genTests(true)
