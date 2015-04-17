var logger = require('winston');

var setup = {
  initialize: function(bearerToken, opts, callback) {
    logger.info('running initialize!');
    callback(null, {bearerToken: bearerToken, opts: opts, functionName: 'initialize'});
  },

  runSetupErrorStep: function(bearerToken, opts, callback) {
    logger.info('running runSetupErrorStep!');
    callback(new Error('runSetupErrorStep'));
  },

  runSetupSuccessStep: function(bearerToken, opts, callback) {
    logger.info('running runSetupSuccessStep!');
    callback(null, {bearerToken: bearerToken, opts: opts, functionName: 'runSetupSuccessStep'});
  }
}

exports.setup = setup;

exports.processSettings = function(bearerToken, settings, callback) {
  logger.info('running processSettings!');

  if (settings.error) {
    return callback(new Error('processSettings'));
  }

  callback(null, {bearerToken: bearerToken, settings: settings, functionName: 'processSettings'});
};
