var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('TEST_INTEGRATOR_EXTENSION_PORT')
var bearerToken = nconf.get('TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN');
var systemToken = nconf.get('INTEGRATOR_EXTENSION_SYSTEM_TOKEN');

var _importId = '_importId';
var _exportId = '_exportId';

describe('Hook tests', function() {

  it('should pass after successfully calling hook function', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: ['hooks', 'doSomething'],
      maxResponsSize: 2000,
      postBody: {
        key1: ['abc'],
        key2: {k: 'v'},
        bearerToken: bearerToken,
        _importId: _importId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      logger.info(body);
      res.statusCode.should.equal(200);

      postBody.postBody.function = 'doSomething';
      assert.deepEqual(body, [postBody.postBody]);

      done();
    }, systemToken);
  });

  it('should fail with 422 for error', function(done) {
    var setupStepUrl = baseURL + '/function'
    var postBody = {
      module: 'dummy-module',
      function: ['hooks', 'doSomethingError'],
      maxResponsSize: 2000,
      postBody: {
        key1: ['abc'],
        bearerToken: bearerToken,
        _importId: _importId
      }
    };

    testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [ { code: 'my_error', message: 'doSomethingError'} ] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

});
