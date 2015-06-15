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

  describe('Import function tests', function() {

    it('should pass after successfully calling import function', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        module: 'dummy-module',
        function: ['import', 'doSomething'],
        maxPageSize: 2000,
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

        postBody.postBody.functionName = 'doSomething';
        assert.deepEqual(body, [postBody.postBody]);

        done();
      }, systemToken);
    });

    it('should fail with 422 for error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        module: 'dummy-module',
        function: ['import', 'doSomethingError'],
        maxPageSize: 2000,
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

    it('should fail when response is greater than max page size', generateMaxPageSizeTest(true));
    it('should fail when response is not searializable', generateNonStringifiableResponseTest(true));
  });

  describe('Export function tests', function() {

    it('should pass after successfully calling export function', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        module: 'dummy-module',
        function: ['export', 'doSomething'],
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          key2: {k: 'v'},
          bearerToken: bearerToken,
          _exportId: _exportId
        }
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(200);
        logger.info(body);

        postBody.postBody.functionName = 'doSomething';
        assert.deepEqual(body, [postBody.postBody]);

        done();
      }, systemToken);
    });

    it('should fail with 422 for error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        module: 'dummy-module',
        function: ['export', 'doSomethingError'],
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          key2: {k: 'v'},
          bearerToken: bearerToken,
          _exportId: _exportId
        }
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [ { code: 'my_error', message: 'doSomethingError'} ] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail when response is greater than max page size', generateMaxPageSizeTest(false));
    it('should fail when response is not searializable', generateNonStringifiableResponseTest(false));
  });

  function generateMaxPageSizeTest(isImport) {
    return function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        module: 'dummy-module',
        function: [],
        maxPageSize: 2,
        postBody: {
          resp: ['abc', 'abc'],
          bearerToken: bearerToken
        }
      };

      if (isImport) {
        postBody.function.push('import');
        postBody.postBody._importId = _importId;
      } else {
        postBody.function.push('export');
        postBody.postBody._exportId = _exportId;
      }

      postBody.function.push('echoResponse');

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        logger.info(body);
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"invalid_hook_response","message":"hook response object size exceeds max page size 2"}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    }
  }

  function generateNonStringifiableResponseTest(isImport) {
    return function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        module: 'dummy-module',
        function: [],
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          bearerToken: bearerToken
        }
      };

      if (isImport) {
        postBody.function.push('import');
        postBody.postBody._importId = _importId;
      } else {
        postBody.function.push('export');
        postBody.postBody._exportId = _exportId;
      }

      postBody.function.push('respondWithNonSearializableObject');
      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        logger.info(body);
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"invalid_hook_response","message":"hook response object not serializable [stringified/parsed object not same as original]"}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    }
  }

});
