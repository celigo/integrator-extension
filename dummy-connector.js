var logger = require('winston');

var setup = {
  initialize: function(bearerToken, _integrationId, opts, callback) {
    logger.info('running setup initialize!');
    return callback(null, {bearerToken: bearerToken, _integrationId: _integrationId, opts: opts, functionName: 'initialize'});
  },

  runSetupErrorStep: function(bearerToken, _integrationId, opts, callback) {
    logger.info('running runSetupErrorStep!');
    return callback(new Error('runSetupErrorStep'));
  },

  runSetupSuccessStep: function(bearerToken, _integrationId, opts, callback) {
    logger.info('running runSetupSuccessStep!');
    return callback(null, {bearerToken: bearerToken, _integrationId: _integrationId, opts: opts, functionName: 'runSetupSuccessStep'});
  }
}


var processSettings = function(bearerToken, _integrationId, settings, callback) {
  logger.info('running processSettings!');
  if (settings.error) {
    return callback(new Error('processSettings'));
  }

  return callback(null, {bearerToken: bearerToken, _integrationId: _integrationId, settings: settings, functionName: 'processSettings'});
};

var imp = {
  doSomethingError: function(bearerToken, _importId, arg1, callback) {
    logger.info('running import doSomethingError!');

    var error = new Error('doSomethingError');
    error.name = 'my_error';

    return callback(error);
  },

  doSomething: function(bearerToken, _importId, arg1, arg2, callback) {
    logger.info('running import doSomething!');

    return callback(null, [{bearerToken: bearerToken, _importId: _importId, arg1: arg1, arg2: arg2, functionName: 'doSomething'}]);
  },

  echoResponse: function(bearerToken, _importId, req, resp, callback) {
    logger.info('running import echoResponse!');
    return callback(null, resp);
  },

  respondWithNonSearializableObject: function(bearerToken, _importId, arg1, callback) {
    logger.info('running import respondWithNonStringifiableObject!');

    return callback(null, {
      a: 'b',
      date: new Date()
    });
  }
}

var exp = {
  doSomethingError: function(bearerToken, _exportId, arg1, callback) {
    logger.info('running export doSomethingError!');

    var error = new Error('doSomethingError');
    error.name = 'my_error';

    return callback(error);
  },

  doSomething: function(bearerToken, _exportId, arg1, arg2, callback) {
    logger.info('running export doSomething!');
    return callback(null, [{bearerToken: bearerToken, _exportId: _exportId, arg1: arg1, arg2: arg2, functionName: 'doSomething'}]);
  },

  echoResponse: function(bearerToken, _exportId, req, resp, callback) {
    logger.info('running export echoResponse!');
    return callback(null, resp);
  },

  respondWithNonSearializableObject: function(bearerToken, _exportId, arg1, callback) {
    logger.info('running export respondWithNonStringifiableObject!');

    return callback(null, {
      a: 'b',
      date: new Date()
    });
  }
}

exports.setup = setup;
exports.processSettings = processSettings;
exports.import = imp;
exports.export = exp;
