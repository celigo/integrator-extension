'use strict'

var testUtil = require('./util')

var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var _importId = '_importId'

describe('Wrapper tests', function () {
  before(function (done) {
    testUtil.createMockExtension(true, true, done)
  })

  it('should pass after successfully calling wrapper function', function (done) {
    var extensionProperties = {
      diy: true,
      type: 'wrapper',
      function: 'importOptions',
      maxResponseSize: 2000
    }

    var options = {
      key1: ['abc'],
      key2: {k: 'v'},
      bearerToken: bearerToken,
      _importId: _importId
    }

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      data.should.eql([{statusCode: 200, id: options}])
      done()
    })
  })

  it('should fail with 422 error', function (done) {
    var extensionProperties = {
      diy: true,
      type: 'wrapper',
      function: 'pingError',
      maxResponseSize: 2000
    }

    var options = {
      key1: ['abc'],
      bearerToken: bearerToken,
      _importId: _importId
    }

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      var expected = [{ code: 'pingCode', message: 'pingMessage' }]
      testUtil.validateErrorsRetured(four0xErrors, expected)
      done()
    })
  })
})
