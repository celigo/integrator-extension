var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('TEST_INTEGRATOR_CONNECTOR_PORT')
var bearerToken = nconf.get('TEST_INTEGRATOR_CONNECTOR_BEARER_TOKEN');
var systemToken = nconf.get('TEST_INTEGRATOR_CONNECTOR_SYSTEM_TOKEN');

describe('Dummy connector tests', function() {
  describe('Setup tests', function() {

    it('should pass after successfully executing setup step', function(done) {
      var setupStepUrl = baseURL + '/setup'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'runSetupSuccessStep',
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(200);
        logger.info(body);

        body.bearerToken.should.equal(bearerToken);
        assert.deepEqual(body.opts, postBody.postBody);
        body.functionName.should.equal('runSetupSuccessStep');

        done();
      }, systemToken);
    });

    it('should call initialize setup', function(done) {
      var setupStepUrl = baseURL + '/setup'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'initialize',
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(200);
        logger.info(body);

        body.bearerToken.should.equal(bearerToken);
        assert.deepEqual(body.opts, postBody.postBody);
        body.functionName.should.equal('initialize');

        done();
      }, systemToken);
    });

    it('should fail with 422 for setup error', function(done) {
      var setupStepUrl = baseURL + '/setup'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'runSetupErrorStep',
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [ { code: 'Error', message: 'runSetupErrorStep' } ] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing bearer token error', function(done) {
      var setupStepUrl = baseURL + '/setup'
      var postBody = {
        repository: {name: 'dummy-connector'},
        function: 'runSetupErrorStep',
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"field":"bearerToken","code":"missing_required_field","message":"missing required field in request"}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing function name error', function(done) {
      var setupStepUrl = baseURL + '/setup'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"field":"function","code":"missing_required_field","message":"missing required field in request"}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing repository name error', function(done) {
      var setupStepUrl = baseURL + '/setup'
      var postBody = {
        bearerToken: bearerToken,
        function: 'runSetupErrorStep',
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"field":"repository.name","code":"missing_required_field","message":"missing required field in request"}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing function error', function(done) {
      var setupStepUrl = baseURL + '/setup'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'badFunction',
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"code":"missing_function","message":"badFunction function not found"}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 401 for wrong system token', function(done) {
      var setupStepUrl = baseURL + '/setup'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'runSetupSuccessStep',
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(401);

        res.headers['WWW-Authenticate'.toLowerCase()].should.equal('invalid system token');
        var expected = { errors: [{"code":"unauthorized","message":"invalid system token"}] };
        assert.deepEqual(body, expected);

        done();
      }, 'BAD_TEST_INTEGRATOR_CONNECTOR_SYSTEM_TOKEN');
    });
  });
});
