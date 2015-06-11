var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('TEST_INTEGRATOR_EXTENSION_PORT')
var bearerToken = nconf.get('TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN');
var systemToken = nconf.get('INTEGRATOR_EXTENSION_SYSTEM_TOKEN');
var _integrationId = '_integrationId';

describe('Server tests', function() {
  it('should fail with 422 for missing postbody error', function(done) {
    var setupStepUrl = baseURL + '/setup'
    var postBody = {
      module: 'dummy-module',
      function: 'runSetupSuccessStep'
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"postBody","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for missing module name error', function(done) {
    var setupStepUrl = baseURL + '/setup'
    var postBody = {
      function: 'runSetupErrorStep',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"module","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for missing function error', function(done) {
    var setupStepUrl = baseURL + '/setup'
    var postBody = {
      module: 'dummy-module',
      function: 'badFunction',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"code":"missing_function","message":"badFunction function not found", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 401 for wrong system token', function(done) {
    var setupStepUrl = baseURL + '/setup'
    var postBody = {
      module: 'dummy-module',
      function: 'runSetupSuccessStep',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(401);

      res.headers['WWW-Authenticate'.toLowerCase()].should.equal('invalid system token');
      var expected = { errors: [{"code":"unauthorized","message":"invalid system token", source: 'adaptor'}] };
      assert.deepEqual(body, expected);

      done();
    }, 'BAD_INTEGRATOR_EXTENSION_SYSTEM_TOKEN');
  });
});
