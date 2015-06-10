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
        repository: {name: 'dummy-module'},
        function: 'doSomething',
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
        repository: {name: 'dummy-module'},
        function: 'doSomethingError',
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

    it('should fail with 422 for missing bearer token error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'doSomethingError',
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          _importId: _importId
        }
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"field":"bearerToken","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing _importId', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'doSomethingError',
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          bearerToken: bearerToken
        }
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"missing_required_field","message":"_importId or _exportId must be sent in the request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing function name error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          bearerToken: bearerToken,
          _importId: _importId
        }
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"field":"function","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing repository name error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        function: 'doSomethingError',
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          bearerToken: bearerToken,
          _importId: _importId
        }
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"field":"repository.name","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing function error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'badFunction',
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          bearerToken: bearerToken,
          _importId: _importId
        }
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"missing_function","message":"badFunction function not found", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 401 for wrong system token', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'doSomethingError',
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          bearerToken: bearerToken,
          _importId: _importId
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

    it('should fail when response is greater than max page size', generateMaxPageSizeTest(true));
    it('should fail when response is not searializable', generateNonStringifiableResponseTest(true));
  });

  describe('Export function tests', function() {

    it('should pass after successfully calling export function', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'doSomething',
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
        repository: {name: 'dummy-module'},
        function: 'doSomethingError',
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

    it('should fail with 422 for missing bearer token error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'doSomethingError',
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          key2: {k: 'v'},
          _exportId: _exportId
        }
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"field":"bearerToken","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing _exportId', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'doSomethingError',
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          key2: {k: 'v'},
          bearerToken: bearerToken
        }
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"missing_required_field","message":"_importId or _exportId must be sent in the request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing function name error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
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
        var expected = { errors: [{"field":"function","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing repository name error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        function: 'doSomethingError',
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
        var expected = { errors: [{"field":"repository.name","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing function error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'badFunction',
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
        var expected = { errors: [{"code":"missing_function","message":"badFunction function not found", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 401 for wrong system token', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'doSomethingError',
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          key2: {k: 'v'},
          bearerToken: bearerToken,
          _exportId: _exportId
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

    it('should fail when response is greater than max page size', generateMaxPageSizeTest(false));
    it('should fail when response is not searializable', generateNonStringifiableResponseTest(false));
  });

  describe('Misc function tests', function() {

    it('should fail when both _importId and exportId are sent', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'doSomething',
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          bearerToken: bearerToken,
          _importId: _importId,
          _exportId: _exportId
        }
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"invalid_request","message":"both _importId and _exportId must not be sent together", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });
  });

  function generateMaxPageSizeTest(isImport) {
    return function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-module'},
        function: 'echoResponse',
        maxPageSize: 2,
        postBody: {
          resp: ['abc', 'abc'],
          bearerToken: bearerToken
        }
      };

      if (isImport) {
        postBody.postBody._importId = _importId;
      } else {
        postBody.postBody._exportId = _exportId;
      }

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
        repository: {name: 'dummy-module'},
        function: 'respondWithNonSearializableObject',
        maxPageSize: 2000,
        postBody: {
          key1: ['abc'],
          bearerToken: bearerToken
        }
      };

      if (isImport) {
        postBody.postBody._importId = _importId;
      } else {
        postBody.postBody._exportId = _exportId;
      }

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
