var should = require('should');
var assert = require('assert');
var nconf = require('nconf');
var logger = require('winston');
var testUtil = require('./util');

var baseURL = 'http://localhost:' + nconf.get('TEST_INTEGRATOR_EXTENSION_PORT')
var bearerToken = nconf.get('TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN');
var systemToken = nconf.get('INTEGRATOR_EXTENSION_SYSTEM_TOKEN');
var _integrationId = '_integrationId';

var functionURL = baseURL + '/function'
describe('Connector settings tests', function() {

  it('should fail with 422 for persistSettings error', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['settings', 'persistSettings'],
      postBody: {
        error: true,
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(422);
      var expected = { errors: [ { code: 'Error', message: 'persistSettings' } ] };

      assert.deepEqual(body, expected);
      done();
    }, systemToken);
  });

  it('should pass after successfully executing persistSettings', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['settings', 'persistSettings'],
      postBody: {
        pending: {fieldOne: 'oldValue', fieldTwo: 'newValue'},
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(200);
      // logger.info(body);

      postBody.postBody.function = 'persistSettings';
      assert.deepEqual(body, postBody.postBody);

      done();
    }, systemToken);
  });

  it('should pass after successfully executing refreshMetadata', function(done) {
    var postBody = {
      module: 'dummy-module',
      function: ['settings', 'refreshMetadata'],
      postBody: {
        key: 'value',
        bearerToken: bearerToken,
        _integrationId: _integrationId
      }
    };

    testUtil.postRequest(functionURL, postBody, function(error, res, body) {
      res.statusCode.should.equal(200);
      // logger.info(body);

      postBody.postBody.function = 'refreshMetadata';
      assert.deepEqual(body, postBody.postBody);

      done();
    }, systemToken);
  });

});
