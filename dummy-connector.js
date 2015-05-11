var logger = require('winston');
var nconf = require('nconf');
var Promise = require('bluebird');

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
    logger.info('running runSetupSuccessStep!');
    callback(null, {bearerToken: bearerToken, _integrationId: _integrationId, opts: opts, functionName: 'runSetupSuccessStep'});
  }
}


var processSettings = function(bearerToken, _integrationId, settings, callback) {
  logger.info('running processSettings!');

  if (settings.error) {
    return callback(new Error('processSettings'));
  }

  callback(null, {bearerToken: bearerToken, _integrationId: _integrationId, settings: settings, functionName: 'processSettings'});
};

var imp = {
  doSomethingError: function(bearerToken, _importId, arg1) {
    logger.info('running doSomethingError!');

    return new Promise(function (fulfill, reject) {
      reject(new Error('doSomethingError'));
    });
  },

  doSomething: function(bearerToken, _importId, arg1, arg2) {
    logger.info('running doSomething!');

    return new Promise(function (fulfill, reject) {
      fulfill({bearerToken: bearerToken, _importId: _importId, arg1: arg1, arg2: arg2, functionName: 'doSomething'});
    });
  }
}

var exp = {
  doSomethingError: function(bearerToken, _exportId, arg1, callback) {
    logger.info('running doSomethingError!');

    return new Promise(function (fulfill, reject) {
      reject(new Error('doSomethingError'));
    });
  },

  doSomething: function(bearerToken, _exportId, arg1, arg2, callback) {
    logger.info('running doSomething!');

    return new Promise(function (fulfill, reject) {
      fulfill({bearerToken: bearerToken, _exportId: _exportId, arg1: arg1, arg2: arg2, functionName: 'doSomething'});
    });
  }
}

exports.setup = setup;
exports.processSettings = processSettings;
exports.import = imp;
exports.export = exp;
