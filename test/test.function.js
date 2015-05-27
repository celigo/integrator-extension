var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('TEST_INTEGRATOR_CONNECTOR_PORT')
var bearerToken = nconf.get('TEST_INTEGRATOR_CONNECTOR_BEARER_TOKEN');
var systemToken = nconf.get('INTEGRATOR_CONNECTOR_SYSTEM_TOKEN');

var _importId = '_importId';
var _exportId = '_exportId';

describe('Dummy connector function tests', function() {

  describe('Import function tests', function() {

    it('should pass after successfully calling import function', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomething',
        _importId: _importId,
        postBody: [['abc'], {k: 'v'}]
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(200);
        logger.info(body);

        body.bearerToken.should.equal(bearerToken);
        body.functionName.should.equal('doSomething');
        body._importId.should.equal(_importId);

        assert.deepEqual(body.arg1, ['abc']);
        assert.deepEqual(body.arg2, {k: 'v'});

        done();
      }, systemToken);
    });

    it('should pass after successfully calling import function with more args than declared - future backward compatibility', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomething',
        _importId: _importId,
        postBody: [['abc'], {k: 'v'}]
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(200);
        logger.info(body);

        body.bearerToken.should.equal(bearerToken);
        body.functionName.should.equal('doSomething');
        body._importId.should.equal(_importId);

        assert.deepEqual(body.arg1, ['abc']);
        assert.deepEqual(body.arg2, {k: 'v'});

        done();
      }, systemToken);
    });

    it('should fail with 422 for error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomethingError',
        _importId: _importId,
        postBody: [[{key: 'value'}]]
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [ { code: 'my_error', message: 'doSomethingError', "source":"_connector" } ] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing bearer token error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-connector'},
        function: 'doSomethingError',
        _importId: _importId,
        postBody: [{key: 'value'}]
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
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomethingError',
        postBody: {key: 'value'}
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
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        _importId: _importId,
        postBody: [[{key: 'value'}]]
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
        bearerToken: bearerToken,
        function: 'doSomethingError',
        _importId: _importId,
        postBody: {key: 'value'}
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
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'badFunction',
        _importId: _importId,
        postBody: [[{key: 'value'}]]
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"missing_function","message":"badFunction function not found", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for non array post body', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomethingError',
        _importId: _importId,
        postBody: {key: 'value'}
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"invalid_args","message":"postBody must be an array", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 401 for wrong system token', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomethingError',
        _importId: _importId,
        postBody: {key: 'value'}
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(401);

        res.headers['WWW-Authenticate'.toLowerCase()].should.equal('invalid system token');
        var expected = { errors: [{"code":"unauthorized","message":"invalid system token", source: 'adaptor'}] };
        assert.deepEqual(body, expected);

        done();
      }, 'BAD_INTEGRATOR_CONNECTOR_SYSTEM_TOKEN');
    });
  });

  describe('Export function tests', function() {

    it('should pass after successfully calling export function', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomething',
        _exportId: _exportId,
        postBody: [['abc'], {k: 'v'}]
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(200);
        logger.info(body);

        body.bearerToken.should.equal(bearerToken);
        body.functionName.should.equal('doSomething');
        body._exportId.should.equal(_exportId);

        assert.deepEqual(body.arg1, ['abc']);
        assert.deepEqual(body.arg2, {k: 'v'});

        done();
      }, systemToken);
    });

    it('should pass after successfully calling export function with more args than declared - future backward compatibility', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomething',
        _exportId: _exportId,
        postBody: [['abc'], {k: 'v'}, 'aa']
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(200);
        logger.info(body);

        body.bearerToken.should.equal(bearerToken);
        body.functionName.should.equal('doSomething');
        body._exportId.should.equal(_exportId);

        assert.deepEqual(body.arg1, ['abc']);
        assert.deepEqual(body.arg2, {k: 'v'});

        done();
      }, systemToken);
    });

    it('should fail with 422 for error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomethingError',
        _exportId: _exportId,
        postBody: [[{key: 'value'}]]
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [ { code: 'my_error', message: 'doSomethingError', "source":"_connector" } ] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing bearer token error', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        repository: {name: 'dummy-connector'},
        function: 'doSomethingError',
        _exportId: _exportId,
        postBody: [{key: 'value'}]
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
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomethingError',
        postBody: {key: 'value'}
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
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        _exportId: _exportId,
        postBody: [[{key: 'value'}]]
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
        bearerToken: bearerToken,
        function: 'doSomethingError',
        _exportId: _exportId,
        postBody: {key: 'value'}
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
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'badFunction',
        _exportId: _exportId,
        postBody: [[{key: 'value'}]]
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"missing_function","message":"badFunction function not found", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for non array post body', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomethingError',
        _exportId: _exportId,
        postBody: {key: 'value'}
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"invalid_args","message":"postBody must be an array", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 401 for wrong system token', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomethingError',
        _exportId: _exportId,
        postBody: {key: 'value'}
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(401);

        res.headers['WWW-Authenticate'.toLowerCase()].should.equal('invalid system token');
        var expected = { errors: [{"code":"unauthorized","message":"invalid system token", source: 'adaptor'}] };
        assert.deepEqual(body, expected);

        done();
      }, 'BAD_INTEGRATOR_CONNECTOR_SYSTEM_TOKEN');
    });
  });

  describe('Misc function tests', function() {

    it('should fail when both _importId and exportId are sent', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomething',
        _importId: _importId,
        _exportId: _exportId,
        postBody: ['abc', {k: 'v'}]
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"invalid_request","message":"both _importId and _exportId must not be sent together", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail when first argument is not an array', function(done) {
      var setupStepUrl = baseURL + '/function'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'doSomething',
        _importId: _importId,
        postBody: ['abc', {k: 'v'}]
      };

      testUtil.postRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"invalid_args","message":"first argument must be an array", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });
  });

});
