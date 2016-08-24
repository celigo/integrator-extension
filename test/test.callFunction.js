'use strict'

var testUtil = require('./util')
var should = require('should')

var bearerToken = 'ott873f2beed978433997c42b4e5af05d9b'

describe('Extension callFunction tests', function () {
  before(function (done) {
    testUtil.createMockExtension(true, true, done)
  })

  it('should return error when extension properties doesn\'t have type field set.', function (done) {
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

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      var expected = [{
        code: 'missing_required_field',
        message: 'Missing required field type in the extension options.'
      }]
      testUtil.validateErrorsRetured(four0xErrors, expected)
      done()
    })
  })

  it('should return error when extensionOptions doesn\'t have function field set.', function (done) {
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

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      var expected = [{
        code: 'missing_required_field',
        message: 'Missing required field function in the extension options.'
      }]
      testUtil.validateErrorsRetured(four0xErrors, expected)
      done()
    })
  })

  it('should return error when options parameter is not set', function (done) {
    var extensionProperties = {
      diy: true,
      function: 'doSomething',
      type: 'hook'
    }

    testUtil.callFunction(null, extensionProperties, function (four0xErrors, data) {
      var expected = [{
        code: 'missing_required_field',
        message: 'Function options haven\'t been provided.'
      }]
      testUtil.validateErrorsRetured(four0xErrors, expected)
      done()
    })
  })

  it('should return error when extensionProperties doesn\'t have either of diy or _connectorId fields set', function (done) {
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

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      var expected = [{
        code: 'missing_required_field',
        message: 'Need to set either the diy or _connectorId field in extension options.'
      }]
      testUtil.validateErrorsRetured(four0xErrors, expected)
      done()
    })
  })

  describe('DIY and connectors test', function () {
    it('should return error when diy is set in extensionOptions but the diy is not set in the extension configuration', function (done) {
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

      testUtil.createMockExtension(false, true, function (err) {
        if (err) return done(err)

        testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
          var expected = [{
            code: 'missing_required_field',
            message: 'DIY is not configured in the extension configuration.'
          }]

          testUtil.validateErrorsRetured(four0xErrors, expected)
          testUtil.createMockExtension(true, true, done)
        })
      })
    })

    it('should return error when connectors doesn\'t exist but _connectorId is set.', function (done) {
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

      testUtil.createMockExtension(false, true, function (err) {
        if (err) return done(err)

        testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
          var expected = [{
            code: 'missing_required_field',
            message: 'Need to set either the diy or _connectorId field in extension options.'
          }]
          testUtil.validateErrorsRetured(four0xErrors, expected)
          testUtil.createMockExtension(true, true, done)
        })
      })
    })
  })

  it('should fail with 422 when data returned exceeds max size.', function (done) {
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

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      var expected = [{'code': 'response_size_exceeded', 'message': 'response stream exceeded limit of 2 bytes.'}]
      testUtil.validateErrorsRetured(four0xErrors, expected)
      done()
    })
  })

  it('should fail with 422 when data returned is not serializable.', function (done) {
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

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      var expected = [{'code': 'invalid_extension_response', 'message': 'Extension response is not serializable.'}]
      testUtil.validateErrorsRetured(four0xErrors, expected)
      done()
    })
  })

  it('should pass when request size is greater than default 100kb.', function (done) {
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

    testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
      should.not.exist(four0xErrors)
      done()
    })
  })
})
