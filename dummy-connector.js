var logger = require('winston');
var nconf = require('nconf');

var setup = {
  initialize: function(bearerToken, _integrationId, opts, callback) {
    logger.info('running initialize!');
    callback(null, {bearerToken: bearerToken, _integrationId: _integrationId, opts: opts, functionName: 'initialize'});
  },

  runSetupErrorStep: function(bearerToken, _integrationId, opts, callback) {
    logger.info('running runSetupErrorStep!');
    callback(new Error('runSetupErrorStep'));
  },

  runSetupSuccessStep: function(bearerToken, _integrationId, opts, callback) {
    if (bearerToken !== nconf.get('TEST_INTEGRATOR_CONNECTOR_BEARER_TOKEN')) {
      return callback(new Error('invalid bearerToken'));
    }

    logger.info('running runSetupSuccessStep!');
    callback(null, {bearerToken: bearerToken, _integrationId: _integrationId, opts: opts, functionName: 'runSetupSuccessStep'});
  }
}

exports.setup = setup;

exports.processSettings = function(bearerToken, _integrationId, settings, callback) {
  logger.info('running processSettings!');

  if (settings.error) {
    return callback(new Error('processSettings'));
  }

  if (bearerToken !== nconf.get('TEST_INTEGRATOR_CONNECTOR_BEARER_TOKEN')) {
    return callback(new Error('invalid bearerToken'));
  }

  callback(null, {bearerToken: bearerToken, _integrationId: _integrationId, settings: settings, functionName: 'processSettings'});
};
