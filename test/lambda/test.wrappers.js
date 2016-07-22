'use strict'

var testUtil = require('./util')

var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var _importId = '_importId'

describe('Lambda wrapper tests', function () {
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

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      data.StatusCode.should.equal(200)
      var body = JSON.parse(data.Payload)
      body.should.eql([{statusCode: 200, id: options}])

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

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      var expected = [{ code: 'pingCode', message: 'pingMessage' }]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })
})
