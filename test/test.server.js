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
describe('Server tests', function() {

  it('should fail with 422 for missing postbody error', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['runInstallerSuccessStep']
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"postBody","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for missing module name error', function(done) {
    var postBody = {
      function: ['runInstallerErrorStep'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"module","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for module not found error', function(done) {
    var postBody = {
      module: 'bad-module',
      function: ['runInstallerErrorStep'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"code":"module_not_found","message":"bad-module module not found", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for missing function field error', function(done) {
    var postBody = {
      module: 'dummy-module',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"function","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for non array function field error', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: 'func',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"function","code":"invalid_field","message":"function must be an array", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for zero length function field error', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: [],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"field":"function","code":"invalid_field","message":"function length must be more than zero", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for missing function error', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['installer', 'badFunction'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"code":"missing_function","message":"badFunction not found", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 for not a function error', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['installer', 'notAFunction'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [{"code":"missing_function","message":"notAFunction is not a function", source: 'adaptor'}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 401 for wrong system token', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: 'runInstallerSuccessStep',
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(401);

      res.headers['WWW-Authenticate'.toLowerCase()].should.equal('invalid system token');
      var expected = { errors: [{"code":"unauthorized","message":"invalid system token", source: 'adaptor'}] };
      assert.deepEqual(body, expected);

      done();
    }, 'BAD_INTEGRATOR_EXTENSION_SYSTEM_TOKEN');
  });

  it('should fail with 422 when response exceeds max size', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['hooks', 'echoResponse'],
      maxResponsSize: 2,
      postBody: {
        resp: ['abc', 'abc'],
        bearerToken: bearerToken
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      // logger.info(body);
      res.statusCode.should.equal(422);
      var expected = { errors: [{"code":"response_size_exceeded","message":"response stream exceeded limit of 2 bytes."}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should fail with 422 when response is not serializable', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['hooks', 'respondWithNonSearializableObject'],
      maxResponsSize: 2000,
      postBody: {
        key1: ['abc'],
        bearerToken: bearerToken
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      // logger.info(body);
      res.statusCode.should.equal(422);
      var expected = { errors: [{"code":"invalid_extension_response","message":"extension response is not serializable."}] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should pass when request size is greater than default 100kb', function(done) {
    var largeString = 'a';
    for (var i = 0; i < 4000000; i++) {
      largeString += 'a'
    }

    var postBody = {
      module: 'dummy-module',
      function: ['hooks', 'echoResponse'],
      maxResponsSize: 2000,
      postBody: {
        key1: [largeString],
        bearerToken: bearerToken
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      // logger.info(body);
      res.statusCode.should.equal(200);

      done();
    }, systemToken);
  });
});
