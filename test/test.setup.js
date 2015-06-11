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
    var setupStepUrl = baseURL + '/setup'
    var postBody = {
      module: 'dummy-module',
      function: 'runSetupSuccessStep',
      postBody: {
        key1: 'value1',
        key2: 'value1',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(200);
      logger.info(body);

      postBody.postBody.functionName = 'runSetupSuccessStep';
      assert.deepEqual(body, postBody.postBody);

      done();
    }, systemToken);
  });

  it('should call initialize setup', function(done) {
    var setupStepUrl = baseURL + '/setup'
    var postBody = {
      module: 'dummy-module',
      function: 'initialize',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(200);
      logger.info(body);

      postBody.postBody.functionName = 'initialize';
      assert.deepEqual(body, postBody.postBody);

      done();
    }, systemToken);
  });

  it('should fail with 422 for setup error', function(done) {
    var setupStepUrl = baseURL + '/setup'
    var postBody = {
      module: 'dummy-module',
      function: 'runSetupErrorStep',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [ { code: 'Error', message: 'runSetupErrorStep'} ] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

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

  it('should fail with 422 for missing bearer token error', function(done) {
    var setupStepUrl = baseURL + '/setup'
    var postBody = {
      module: 'dummy-module',
      function: 'runSetupErrorStep',
      postBody: {
        key: 'value',
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

  it('should fail with 422 for missing _integrationId', function(done) {
    var setupStepUrl = baseURL + '/setup'
    var postBody = {
      module: 'dummy-module',
      function: 'runSetupErrorStep',
      postBody: {
        key: 'value',
        bearerToken: bearerToken
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"_integrationId","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for missing function name error', function(done) {
    var setupStepUrl = baseURL + '/setup'
    var postBody = {
      module: 'dummy-module',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"function","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

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
