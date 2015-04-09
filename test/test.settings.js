var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('IC_PORT')
var bearerToken = nconf.get('BEARER_TOKEN');
var systemToken = nconf.get('SYSTEM_TOKEN');

describe('Dummy connector tests', function() {

  describe('Setting tests', function() {
    it('should fail with 422 for settings error', function(done) {
      var setupStepUrl = baseURL + '/settings'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        postBody: {error: true}
      };

      testUtil.putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [ { code: 'Error', message: 'processSettings' } ] };

        assert.deepEqual(body, expected);
        done();
      }, systemToken);
    });

    it('should pass after successfully executing settings step', function(done) {
      var setupStepUrl = baseURL + '/settings'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
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
        done();
      }, systemToken);
    });

    // TODO invalid token
  });
});
