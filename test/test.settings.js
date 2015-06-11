var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('TEST_INTEGRATOR_EXTENSION_PORT')
var bearerToken = nconf.get('TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN');
var systemToken = nconf.get('INTEGRATOR_EXTENSION_SYSTEM_TOKEN');
var _integrationId = '_integrationId';

describe('Connector settings tests', function() {

  it('should fail with 422 for settings error', function(done) {
    var setupStepUrl = baseURL + '/settings'
    var postBody = {
      module: 'dummy-module',
      postBody: {
        error: true,
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [ { code: 'Error', message: 'processSettings' } ] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should pass after successfully executing settings step', function(done) {
    var setupStepUrl = baseURL + '/settings'
    var postBody = {
      module: 'dummy-module',
      postBody: {
        persisted: {fieldOne: 'oldValue', fieldTwo: 'oldValue'},
        pending: {fieldOne: 'oldValue', fieldTwo: 'newValue'},
        delta: {fieldTwo: 'newValue'},
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(200);
      logger.info(body);

      postBody.postBody.functionName = 'processSettings';
      assert.deepEqual(body, postBody.postBody);

      done();
    }, systemToken);
  });

  it('should fail with 422 for missing bearer token error', function(done) {
    var setupStepUrl = baseURL + '/settings'
    var postBody = {
      module: 'dummy-module',
      postBody: {
        persisted: {fieldOne: 'oldValue', fieldTwo: 'oldValue'},
        pending: {fieldOne: 'oldValue', fieldTwo: 'newValue'},
        delta: {fieldTwo: 'newValue'},
        _integrationId: _integrationId
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"bearerToken","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });
});
