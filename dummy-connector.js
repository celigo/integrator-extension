var logger = require('winston');

var setup = {
  runSetupErrorStep: function(bearerToken, opts, callback) {
    logger.info('running runSetupErrorStep!');
    callback(new Error('runSetupErrorStep'));
  },

  runSetupSuccessStep: function(bearerToken, opts, callback) {
    logger.info('running runSetupSuccessStep!');
    callback(null, {bearerToken: bearerToken, opts: opts});
  }
}

exports.setup = setup;

exports.updateSettings = function(bearerToken, settings, callback) {
  logger.info('running updateSettings!');

  if (settings.error) {
    return callback(new Error('updateSettings'));
  }

  callback(null, {bearerToken: bearerToken, settings: settings});
};
