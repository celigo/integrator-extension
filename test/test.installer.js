'use strict'

var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('TEST_INTEGRATOR_EXTENSION_PORT')
var bearerToken = 'TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN';
var systemToken = nconf.get('INTEGRATOR_EXTENSION_SYSTEM_TOKEN');
var _integrationId = '_integrationId';

var functionURL = baseURL + '/function'
describe('Connector installer tests', function() {
  it('should pass after successfully executing installer step', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['installer', 'runInstallerSuccessStep'],
      postBody: {
        key1: 'value1',
        key2: 'value1',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(200);
      // logger.info(body);

      postBody.postBody.function = 'runInstallerSuccessStep';
      assert.deepEqual(body, postBody.postBody);

      done();
    }, systemToken);
  });

  it('should call connectorInstallerFunction installer', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['installer', 'connectorInstallerFunction'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(200);
      // logger.info(body);

      postBody.postBody.function = 'connectorInstallerFunction';
      assert.deepEqual(body, postBody.postBody);

      done();
    }, systemToken);
  });

  it('should fail with 422 for installer error', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['installer', 'runInstallerErrorStep'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [ { code: 'Error', message: 'runInstallerErrorStep'} ] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });
});
