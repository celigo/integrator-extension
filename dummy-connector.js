var logger = require('winston');

var setup = {
  runSetupErrorStep: function(userBearerToken, payload, callback) {
    logger.info('running runSetupErrorStep!');
    callback(new Error('runSetupErrorStep'));
  },

  runSetupSuccessStep: function(userBearerToken, payload, callback) {
    logger.info('running runSetupSuccessStep!');
    callback(null, {userBearerToken: userBearerToken, payload: payload});
  }
}

exports.setup = setup;

exports.updateSettings = function(userBearerToken, payload, callback) {
  logger.info('running updateSettings!');

  if (payload.error) {
    return callback(new Error('updateSettings'));
  }

  callback(null, {userBearerToken: userBearerToken, payload: payload});
};
