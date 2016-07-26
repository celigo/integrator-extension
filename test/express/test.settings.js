'use strict'

var testUtil = require('./util')

var baseURL = 'http://localhost:' + 7000
var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var systemToken = 'INTEGRATOR_EXTENSION_SYSTEM_TOKEN'
var _integrationId = '_integrationId'
var _connectorId = '9ce44f88a25272b6d9cbb430ebbcfcf1'

var functionURL = baseURL + '/function'

describe('Express connector settings tests', function () {
  before(function (done) {
    testUtil.createMockExpressServer(false, true, done)
  })

  it('should fail with 422 for persistSettings error', function (done) {
    var options = {
      diy: false,
      _connectorId: _connectorId,
      type: 'setting',
      function: 'persistSettings',
      options: {
        error: true,
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(422)
      var expected = { errors: [ { code: 'Error', message: 'persistSettings' } ] }

      body.should.eql(expected)
      done()
    })
  })

  it('should pass after successfully executing persistSettings', function (done) {
    var options = {
      diy: false,
      _connectorId: _connectorId,
      function: 'persistSettings',
      type: 'setting',
      options: {
        pending: {fieldOne: 'oldValue', fieldTwo: 'newValue'},
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(200)

      options.options.function = 'persistSettings'
      body.should.eql(options.options)

      done()
    })
  })

  it('should pass after successfully executing refreshMetadata', function (done) {
    var options = {
      diy: false,
      _connectorId: _connectorId,
      function: 'refreshMetadata',
      type: 'setting',
      options: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(200)
      options.options.function = 'refreshMetadata'
      body.should.eql(options.options)

      done()
    })
  })

  after(function (done) {
    testUtil.stopMockExpressServer(done)
  })
})
