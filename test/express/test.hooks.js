'use strict'

var testUtil = require('./util')

var baseURL = 'http://localhost:' + 7000
var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var systemToken = 'INTEGRATOR_EXTENSION_SYSTEM_TOKEN'
var _importId = '_importId'

var functionURL = baseURL + '/function'

describe('Express hook tests', function () {
  before(function (done) {
    testUtil.createMockExpressServer(true, true, done)
  })

  it('should pass after successfully calling hook function.', function (done) {
    var options = {
      diy: true,
      type: 'hook',
      function: 'doSomething',
      maxResponseSize: 2000,
      options: {
        key1: ['abc'],
        key2: {k: 'v'},
        bearerToken: bearerToken,
        _importId: _importId
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(200)

      options.options.function = 'doSomething'
      body.should.eql([options.options])

      done()
    })
  })

  it('should fail with 422 for error.', function (done) {
    var options = {
      diy: true,
      type: 'hook',
      function: 'doSomethingError',
      maxResponseSize: 2000,
      options: {
        key1: ['abc'],
        bearerToken: bearerToken,
        _importId: _importId
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(422)
      var expected = { errors: [{ code: 'my_error', message: 'doSomethingError' }] }

      body.should.eql(expected)
      done()
    })
  })

  after(function (done) {
    testUtil.stopMockExpressServer(done)
  })
})
