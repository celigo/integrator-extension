var should = require('should');
var assert = require('assert');
var request = require('request');
var nconf = require('nconf');
var logger = require('winston');

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

      putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [ { code: 'Error', message: 'runSetupErrorStep' } ] };

        assert.deepEqual(body, expected);
        done();
      });
    });

    it('should pass after successfully executing setup step', function(done) {
      var setupStepUrl = baseURL + '/setup'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        function: 'runSetupSuccessStep',
        postBody: {key: 'value'}
      };

      putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(200);
        logger.info(body);

        body.bearerToken.should.equal(bearerToken);
        assert.deepEqual(body.opts, postBody.postBody);
        done();
      });
    });

    // TODO invalid token
  });

  describe('Setting tests', function() {
    it('should fail with 422 for settings error', function(done) {
      var setupStepUrl = baseURL + '/settings'
      var postBody = {
        bearerToken: bearerToken,
        repository: {name: 'dummy-connector'},
        postBody: {error: true}
      };

      putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(422);
        var expected = { errors: [ { code: 'Error', message: 'processSettings' } ] };

        assert.deepEqual(body, expected);
        done();
      });
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

      putRequest(setupStepUrl, postBody, function(error, res, body) {
        res.statusCode.should.equal(200);
        logger.info(body);

        body.bearerToken.should.equal(bearerToken);
        assert.deepEqual(body.settings, postBody.postBody);
        done();
      });
    });

    // TODO invalid token
  });
});

function postRequest(uri, json, callback, bearerToken) {
  var requestOptions = {
    uri: uri,
    json : json,
    method : 'POST',
    auth: {
      bearer: bearerToken || systemToken
    }
  };

  request(requestOptions, function(error, res, body) {
    return callback(error, res, body);
  });
}

function putRequest(uri, json, callback, bearerToken) {
  var requestOptions = {
    uri: uri,
    json : json,
    method : 'PUT',
    auth: {
      bearer: bearerToken || systemToken
    }
  };

  request(requestOptions, function(error, res, body) {
    return callback(error, res, body);
  });
}

function getRequest(uri, callback) {
  var requestOptions = {
    uri: uri,
    method : 'GET',
    json : true,
    auth: {
      bearer: systemToken
    }
  };

  request(requestOptions, function(error, res, body) {
    return callback(error, res, body);
  });
}

function deleteRequest(uri, callback) {
  var requestOptions = {
    uri: uri,
    method : 'DELETE',
    json: true,
    auth: {
      bearer: systemToken
    }
  };

  request(requestOptions, function(error, res, body) {
    return callback(error, res, body);
  });
}
