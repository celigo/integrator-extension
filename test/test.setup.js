var should = require('should');
var assert = require('assert');
var request = require('request');
var nconf = require('nconf');
var logger = require('winston');

var baseURL = 'http://localhost:' + nconf.get('IC_PORT')
var userBearerToken = nconf.get('USER_BEARER_TOKEN');
var connectorBearerToken = nconf.get('CONNECTOR_BEARER_TOKEN');
var userBearerToken = nconf.get('USER_BEARER_TOKEN');

describe('Setup tests', function() {
  it('should fail with 422 for setup error', function(done) {
    var setupStepUrl = baseURL + '/v1/setup'
    var postBody = {
      userBearerToken: userBearerToken,
      repository: {name: 'dummy-connector'},
      function: 'runSetupErrorStep',
      postBody: {key: 'value'}
    };

    postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [ { code: 'Error', message: 'runSetupErrorStep' } ] };

      assert.deepEqual(body, expected);
      done();
    });
  });

  it('should pass after successfully executing setup step', function(done) {
    var setupStepUrl = baseURL + '/v1/setup'
    var postBody = {
      userBearerToken: userBearerToken,
      repository: {name: 'dummy-connector'},
      function: 'runSetupSuccessStep',
      postBody: {key: 'value'}
    };

    postRequest(setupStepUrl, postBody, function(error, res, body) {
      res.statusCode.should.equal(200);
      logger.info(body);

      body.userBearerToken.should.equal(userBearerToken);
      assert.deepEqual(body.payload, postBody.postBody);
      done();
    });
  });
});

function postRequest(uri, json, callback, bearerToken) {
  var requestOptions = {
    uri: uri,
    json : json,
    method : 'POST',
    auth: {
      bearer: bearerToken || connectorBearerToken
    }
  };

  request(requestOptions, function(error, res, body) {
    return callback(error, res, body);
  });
}

function putRequest(uri, json, callback) {
  var requestOptions = {
    uri: uri,
    json : json,
    method : 'PUT',
    auth: {
      bearer: connectorBearerToken
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
      bearer: connectorBearerToken
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
      bearer: connectorBearerToken
    }
  };

  request(requestOptions, function(error, res, body) {
    return callback(error, res, body);
  });
}
