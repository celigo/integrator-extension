'use strict'

var testUtil = require('./util')

var port = 7000
var functionURL = 'http://localhost:' + port + '/function'
var systemToken = 'INTEGRATOR_EXTENSION_SYSTEM_TOKEN'
var bearerToken = 'ott873f2beed978433997c42b4e5af05d9b'

describe('Express /function route tests', function () {
  before(function (done) {
    testUtil.createMockExpressServer(true, true, done)
  })

  it('should return error when request doesn\'t have type field set.', function (done) {
    var options = {
      diy: true,
      function: 'doSomething',
      options: {
        key1: [ 'abc' ],
        key2: { k: 'v' },
        _importId: '56eae39e9a016a71a8a9c7e4',
        bearerToken: bearerToken
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)
      res.statusCode.should.equal(422)
      var expected = {
        code: 'missing_required_field',
        message: 'Missing required field type in the extension options.'
      }

      body.errors[0].should.eql(expected)

      done()
    })
  })

  it('should return error when request doesn\'t have function field set.', function (done) {
    var options = {
      diy: true,
      type: 'hook',
      options: {
        key1: [ 'abc' ],
        key2: { k: 'v' },
        _importId: '56eae39e9a016a71a8a9c7e4',
        bearerToken: bearerToken
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)
      res.statusCode.should.equal(422)

      var expected = {
        code: 'missing_required_field',
        message: 'Missing required field function in the extension options.'
      }

      body.errors[0].should.eql(expected)
      done()
    })
  })

  it('should return error when request doesn\'t have options field set.', function (done) {
    var options =
      { diy: true,
        type: 'hook',
        function: 'doSomething'
      }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)
      res.statusCode.should.equal(422)

      var expected = {
        code: 'missing_required_field',
        message: 'Function options haven\'t been provided.'
      }

      body.errors[0].should.eql(expected)
      done()
    })
  })

  it('should return error when request doesn\'t have either of diy or _connectorId fields set.', function (done) {
    var options = {
      type: 'hook',
      function: 'doSomething',
      options: {
        key1: [ 'abc' ],
        key2: { k: 'v' },
        _importId: '56eae39e9a016a71a8a9c7e4',
        bearerToken: bearerToken
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)
      res.statusCode.should.equal(422)

      var expected = {
        code: 'missing_required_field',
        message: 'Need to set either the diy or _connectorId field in extension options.'
      }

      body.errors[0].should.eql(expected)
      done()
    })
  })

  describe('DIY and connectors test', function () {
    before(function (done) {
      testUtil.stopMockExpressServer(function (err) {
        if (err) {
          err.message.should.equal('Integration-extension-server not deployed.')
          err.code.should.equal('invaid_function_call')
        }
        done()
      })
    })

    it('should return error when diy is set in request but the diy is not set in the integrator extension server.', function (done) {
      var options = {
        type: 'hook',
        diy: true,
        function: 'doSomething',
        options: {
          key1: [ 'abc' ],
          key2: { k: 'v' },
          _importId: '56eae39e9a016a71a8a9c7e4',
          bearerToken: bearerToken
        }
      }

      testUtil.createMockExpressServer(false, true, function (err) {
        if (err) return done(err)

        var functionURL1 = 'http://localhost:' + port + '/function'
        testUtil.postRequest(functionURL1, options, systemToken, function (error, res, body) {
          if (error) return done(error)
          res.statusCode.should.equal(422)

          var expected = {
            code: 'missing_required_field',
            message: 'DIY is not configured in the extension configuration.'
          }

          body.errors[0].should.eql(expected)
          testUtil.stopMockExpressServer(done)
        })
      })
    })

    it('should return error when connectors doesn\'t exist but _connectorId is set.', function (done) {
      var options = {
        type: 'installer',
        diy: false,
        connectorId: '12ege39f7a016v72a8b9c79q',
        function: 'doSomething',
        options: {
          key1: [ 'abc' ],
          key2: { k: 'v' },
          _importId: '56eae39e9a016a71a8a9c7e4',
          bearerToken: bearerToken
        }
      }

      testUtil.createMockExpressServer(false, true, function (err) {
        if (err) return done(err)

        var functionURL1 = 'http://localhost:' + port + '/function'
        testUtil.postRequest(functionURL1, options, systemToken, function (error, res, body) {
          if (error) return done(error)
          res.statusCode.should.equal(422)

          var expected = {
            code: 'missing_required_field',
            message: 'Need to set either the diy or _connectorId field in extension options.'
          }

          body.errors[0].should.eql(expected)
          testUtil.stopMockExpressServer(done)
        })
      })
    })

    after(function (done) {
      testUtil.createMockExpressServer(true, true, done)
    })
  })

  it('should fail with 401 for wrong system token.', function (done) {
    var options = {
      diy: true,
      type: 'installer',
      function: 'runInstallerSuccessStep',
      options: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: '56eae39e9a016a71a8a9c7e4'
      }
    }

    testUtil.postRequest(functionURL, options, 'BAD_INTEGRATOR_EXTENSION_SYSTEM_TOKEN', function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(401)
      res.headers['WWW-Authenticate'.toLowerCase()].should.equal('invalid system token')
      var expected = { errors: [{ code: 'unauthorized', message: 'Invalid system token.' }] }
      body.should.eql(expected)

      done()
    })
  })

  it('should fail with 422 when response exceeds max size.', function (done) {
    var options = {
      diy: true,
      type: 'hook',
      function: 'echoResponse',
      maxResponseSize: 2,
      options: {
        resp: ['abc', 'abc'],
        bearerToken: bearerToken
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(422)
      var expected = { errors: [{'code': 'response_size_exceeded', 'message': 'response stream exceeded limit of 2 bytes.'}] }

      body.should.eql(expected)
      done()
    })
  })

  it('should fail with 422 when response is not serializable.', function (done) {
    var options = {
      diy: true,
      type: 'hook',
      function: 'respondWithNonSearializableObject',
      maxResponseSize: 2000,
      options: {
        key1: ['abc'],
        bearerToken: bearerToken
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(422)
      var expected = { errors: [{'code': 'invalid_extension_response', 'message': 'Extension response is not serializable.'}] }

      body.should.eql(expected)
      done()
    })
  })

  it('should pass when request size is greater than default 100kb.', function (done) {
    var largeString = 'a'
    for (var i = 0; i < 4000000; i++) {
      largeString += 'a'
    }

    var options = {
      diy: true,
      type: 'hook',
      function: 'echoResponse',
      maxResponseSize: 2000,
      options: {
        key1: [largeString],
        bearerToken: bearerToken
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(200)

      done()
    })
  })

  after(function (done) {
    testUtil.stopMockExpressServer(done)
  })
})
