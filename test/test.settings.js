var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('TEST_INTEGRATOR_CONNECTOR_PORT')
var bearerToken = nconf.get('TEST_INTEGRATOR_CONNECTOR_BEARER_TOKEN');
var systemToken = nconf.get('INTEGRATOR_CONNECTOR_SYSTEM_TOKEN');
var _integrationId = '_integrationId';

describe('Dummy connector tests', function() {

  describe('Setting tests', function() {
    it('should fail with 422 for settings error', function(done) {
      var setupStepUrl = baseURL + '/settings'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        _integrationId: _integrationId,
        postBody: {error: true}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [ { code: 'Error', message: 'processSettings', source:'_connector' } ] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should pass after successfully executing settings step', function(done) {
      var setupStepUrl = baseURL + '/settings'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        _integrationId: _integrationId,
        postBody: {
          persisted: {key1: 'value1', key2: 'value21'},
          pending: {key1: 'value2', key2: 'value22'},
          delta: {key1: 'value2'}
        }
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(200);
        logger.info(body);

        body.bearerToken.should.equal(bearerToken);
        assert.deepEqual(body.settings, postBody.postBody);
        body.functionName.should.equal('processSettings');
        body._integrationId.should.equal(_integrationId);

        done();
      }, systemToken);
    });

    it('should fail with 422 for missing bearer token error', function(done) {
      var setupStepUrl = baseURL + '/settings'
      var postBody = {
        repository: {name: 'dummy-connector'},
        _integrationId: _integrationId,
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"field":"bearerToken","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing _integrationId error', function(done) {
      var setupStepUrl = baseURL + '/settings'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"field":"_integrationId","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 422 for missing repository name error', function(done) {
      var setupStepUrl = baseURL + '/settings'
      var postBody = {
        bearerToken: bearerToken,
        _integrationId: _integrationId,
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [{"field":"repository.name","code":"missing_required_field","message":"missing required field in request", source: 'adaptor'}] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should fail with 401 for wrong system token', function(done) {
      var setupStepUrl = baseURL + '/settings'
      var postBody = {
        bearerToken: bearerToken,
        _integrationId: _integrationId,
        repository: {name: 'dummy-connector'},
        postBody: {key: 'value'}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(401);

        res.headers['WWW-Authenticate'.toLowerCase()].should.equal('invalid system token');
        var expected = { errors: [{"code":"unauthorized","message":"invalid system token", source: 'adaptor'}] };
        assert.deepEqual(body, expected);

        done();
      }, 'BAD_INTEGRATOR_CONNECTOR_SYSTEM_TOKEN');
    });

  });
});
