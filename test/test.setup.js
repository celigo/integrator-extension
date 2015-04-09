var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('IC_PORT')
var bearerToken = nconf.get('BEARER_TOKEN');
var systemToken = nconf.get('SYSTEM_TOKEN');

describe('Dummy connector tests', function() {
  describe('Setup tests', function() {
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
        done();
      }, systemToken);
    });

    // TODO invalid token
  });
});
