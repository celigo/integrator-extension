'use strict'

var testUtil = require('./util')

var baseURL = 'http://localhost:' + 7000
var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var systemToken = 'INTEGRATOR_EXTENSION_SYSTEM_TOKEN'
var _importId = '_importId'

var functionURL = baseURL + '/function'

describe('Wrapper tests', function () {
  before(function (done) {
    testUtil.createMockExpressServer(true, true, done)
  })

  it('should pass after successfully calling hook function', function (done) {
    var options = {
      diy: true,
      type: 'wrapper',
      function: 'importOptions',
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
      body.should.eql([{statusCode: 200, id: options.options}])

      done()
    })
  })

  it('should fail with 422 error', function (done) {
    var options = {
      diy: true,
      type: 'wrapper',
      function: 'pingError',
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
      var expected =
      { errors: [ { code: 'pingCode', message: 'pingMessage' } ] }

      body.should.eql(expected)
      done()
    })
  })

  after(function (done) {
    testUtil.stopMockExpressServer(done)
  })
})
