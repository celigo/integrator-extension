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
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: ['runSetupSuccessStep']
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"postBody","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for missing module name error', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      function: ['runSetupErrorStep'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"module","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for module not found error', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'bad-module',
      function: ['runSetupErrorStep'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"code":"module_not_found","message":"bad-module module not found", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for missing function field error', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"function","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for non array function field error', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: 'func',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"function","code":"invalid_field","message":"function must be an array", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for zero length function field error', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: [],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"function","code":"invalid_field","message":"function length must be more than zero", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for missing function error', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: ['setup', 'badFunction'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"code":"missing_function","message":"badFunction not found", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for not a function error', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: ['setup', 'notAFunction'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"code":"missing_function","message":"notAFunction is not a function", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 401 for wrong system token', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: 'runSetupSuccessStep',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(401);

      res.headers['WWW-Authenticate'.toLowerCase()].should.equal('invalid system token');
      var expected = { errors: [{"code":"unauthorized","message":"invalid system token", source: 'adaptor'}] };
      assert.deepEqual(body, expected);

      done();
    }, 'BAD_INTEGRATOR_EXTENSION_SYSTEM_TOKEN');
  });
});
