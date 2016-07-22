'use strict'

var testUtil = require('./util')
var should = require('should')
var invokeFunctionTest = require('./lambda-test-functions').invokeFunctionTest

var bearerToken = 'ott873f2beed978433997c42b4e5af05d9b'

describe('Lambda function error handling tests', function () {
  it('should return error when extension properties doesn\'t have type field set', function (done) {
    var extensionProperties = {
      diy: true,
      function: 'doSomething'
    }

    var options = {
      key1: [ 'abc' ],
      key2: { k: 'v' },
      _importId: '56eae39e9a016a71a8a9c7e4',
      bearerToken: bearerToken
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      var expected = [{
        code: 'missing_required_field',
        message: 'Missing required field type in the extension options.'
      }]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })

  it('should return error when extension properties doesn\'t have function field set', function (done) {
    var extensionProperties = {
      diy: true,
      type: 'hook'
    }

    var options = {
      key1: [ 'abc' ],
      key2: { k: 'v' },
      _importId: '56eae39e9a016a71a8a9c7e4',
      bearerToken: bearerToken
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      var expected = [{
        code: 'missing_required_field',
        message: 'Missing required field function in the extension options.'
      }]

      testUtil.validateErrorRetured(data, expected, done)
    })
  })

  it('should return error when extension properties doesn\'t have either of diy or connectorId fields set', function (done) {
    var extensionProperties = {
      type: 'hook',
      function: 'doSomething'
    }

    var options = {
      key1: [ 'abc' ],
      key2: { k: 'v' },
      _importId: '56eae39e9a016a71a8a9c7e4',
      bearerToken: bearerToken
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      var expected = [{
        code: 'missing_required_field',
        message: 'Need to set either the diy or _connectorId field in extension options.'
      }]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })

  describe('DIY and connectors test', function () {
    it('should return error when diy is set in extension properties but the diy is not set in the integrator extension server', function (done) {
      invokeFunctionTest.options.connectors = {
        'connector1': {
          dummyFunction: function () {}
        }
      }
      var extensionProperties = {
        type: 'hook',
        diy: true,
        function: 'doSomething'
      }
      var options = {
        key1: [ 'abc' ],
        key2: { k: 'v' },
        _importId: '56eae39e9a016a71a8a9c7e4',
        bearerToken: bearerToken
      }

      testUtil.invokeFunction(options, extensionProperties, 'invokeFunctionTest', function (error, data) {
        if (error) return done(error)
        var expected = [{
          code: 'missing_required_field',
          message: 'DIY is not configured in the extension configuration.'
        }]

        testUtil.validateErrorRetured(data, expected, done)
      })
    })

    it('should return error when connectors doesn\'t exist but connectorId is set', function (done) {
      invokeFunctionTest.options.diy = function () {}

      var options = {

        options: {
          key1: [ 'abc' ],
          key2: { k: 'v' },
          _importId: '56eae39e9a016a71a8a9c7e4',
          bearerToken: bearerToken
        }
      }
      var extensionProperties = {
        type: 'installer',
        diy: false,
        connectorId: '12ege39f7a016v72a8b9c79q',
        function: 'doSomething'
      }

      testUtil.invokeFunction(options, extensionProperties, 'invokeFunctionTest', function (error, data) {
        if (error) return done(error)
        var expected = [{
          code: 'missing_required_field',
          message: 'Need to set either the diy or _connectorId field in extension options.'
        }]

        testUtil.validateErrorRetured(data, expected, done)
      })
    })
  })

  it('should fail with 422 when response exceeds max size', function (done) {
    var extensionProperties = {
      diy: true,
      type: 'hook',
      function: 'echoResponse',
      maxResponseSize: 2
    }

    var options = {
      resp: ['abc', 'abc'],
      bearerToken: bearerToken
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      var expected = [{'code': 'response_size_exceeded', 'message': 'response stream exceeded limit of 2 bytes.'}]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })

  it('should fail with 422 when response is not serializable', function (done) {
    var extensionProperties = {
      diy: true,
      type: 'hook',
      function: 'respondWithNonSearializableObject',
      maxResponseSize: 2000
    }

    var options = {
      key1: ['abc'],
      bearerToken: bearerToken
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      var expected = [{'code': 'invalid_extension_response', 'message': 'Extension response is not serializable.'}]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })

  it('should pass when request size is greater than default 100kb', function (done) {
    var largeString = 'a'
    for (var i = 0; i < 4000000; i++) {
      largeString += 'a'
    }

    var extensionProperties = {
      diy: true,
      type: 'hook',
      function: 'echoResponse',
      maxResponseSize: 2000
    }

    var options = {
      key1: [largeString],
      bearerToken: bearerToken
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      data.StatusCode.should.equal(200)
      should.not.exist(data.FunctionError)
      done()
    })
  })

  it('should return error when function options is not provided.', function (done) {
    var extensionProperties = {
      diy: true,
      function: 'doSomething',
      type: 'hook'
    }

    testUtil.invokeFunction(null, extensionProperties, 'hooksWrappersTest', function (error, data) {
      if (error) return done(error)

      var expected = [{
        code: 'missing_required_field',
        message: 'Function options haven\'t been provided.'
      }]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })
})
