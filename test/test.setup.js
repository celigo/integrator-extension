var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('TEST_INTEGRATOR_EXTENSION_PORT')
var bearerToken = nconf.get('TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN');
var systemToken = nconf.get('INTEGRATOR_EXTENSION_SYSTEM_TOKEN');
var _integrationId = '_integrationId';

describe('Connector setup tests', function() {
  it('should pass after successfully executing setup step', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: ['setup', 'runSetupSuccessStep'],
      postBody: {
        key1: 'value1',
        key2: 'value1',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(200);
      logger.info(body);

      postBody.postBody.functionName = 'runSetupSuccessStep';
      assert.deepEqual(body, postBody.postBody);

      done();
    }, systemToken);
  });

  it('should call initialize setup', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: ['setup', 'initialize'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(200);
      logger.info(body);

      postBody.postBody.functionName = 'initialize';
      assert.deepEqual(body, postBody.postBody);

      done();
    }, systemToken);
  });

  it('should fail with 422 for setup error', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: ['setup', 'runSetupErrorStep'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [ { code: 'Error', message: 'runSetupErrorStep'} ] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });
});
