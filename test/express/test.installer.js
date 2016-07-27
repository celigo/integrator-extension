'use strict'

var testUtil = require('./util')

var baseURL = 'http://localhost:' + 7000
var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN'
var systemToken = 'INTEGRATOR_EXTENSION_SYSTEM_TOKEN'
var _integrationId = '_integrationId'
var _connectorId = '9ce44f88a25272b6d9cbb430ebbcfcf1'

var functionURL = baseURL + '/function'

describe('Express connector installer tests', function () {
  before(function (done) {
    testUtil.createMockExpressServer(false, true, done)
  })

  it('should pass after successfully executing installer step.', function (done) {
    var options = {
      _connectorId: _connectorId,
      type: 'installer',
      function: 'runInstallerSuccessStep',
      options: {
        key1: 'value1',
        key2: 'value1',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(200)
      options.options.function = 'runInstallerSuccessStep'
      body.should.eql(options.options)

      done()
    })
  })

  it('should call connectorInstallerFunction installer.', function (done) {
    var options = {
      _connectorId: _connectorId,
      type: 'installer',
      function: 'connectorInstallerFunction',
      options: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(200)
      options.options.function = 'connectorInstallerFunction'
      body.should.eql(options.options)

      done()
    })
  })

  it('should fail with 422 for installer error.', function (done) {
    var options = {
      _connectorId: _connectorId,
      type: 'installer',
      function: 'runInstallerErrorStep',
      options: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    }

    testUtil.postRequest(functionURL, options, systemToken, function (error, res, body) {
      if (error) return done(error)

      res.statusCode.should.equal(422)
      var expected = { errors: [{ code: 'Error', message: 'runInstallerErrorStep' }] }
      body.should.eql(expected)

      done()
    })
  })

  after(function (done) {
    testUtil.stopMockExpressServer(done)
  })
})
