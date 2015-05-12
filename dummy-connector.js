var logger = require('winston');
var nconf = require('nconf');
var Promise = require('bluebird');

var setup = {
  initialize: function(bearerToken, _integrationId, opts) {
    return new Promise(function (fulfill, reject) {
      logger.info('running initialize!');

      fulfill({bearerToken: bearerToken, _integrationId: _integrationId, opts: opts, functionName: 'initialize'});
    });
  },

  runSetupErrorStep: function(bearerToken, _integrationId, opts) {
    return new Promise(function (fulfill, reject) {
      logger.info('running runSetupErrorStep!');

      reject(new Error('runSetupErrorStep'));
    });
  },

  runSetupSuccessStep: function(bearerToken, _integrationId, opts) {
    return new Promise(function (fulfill, reject) {
      logger.info('running runSetupSuccessStep!');

      fulfill({bearerToken: bearerToken, _integrationId: _integrationId, opts: opts, functionName: 'runSetupSuccessStep'});
    });
  }
}


var processSettings = function(bearerToken, _integrationId, settings) {
  return new Promise(function (fulfill, reject) {
    logger.info('running processSettings!');
    if (settings.error) {
      return reject(new Error('processSettings'));
    }

    fulfill({bearerToken: bearerToken, _integrationId: _integrationId, settings: settings, functionName: 'processSettings'});
  });
};

var imp = {
  doSomethingError: function(bearerToken, _importId, arg1) {
    return new Promise(function (fulfill, reject) {
      logger.info('running doSomethingError!');

      var error = new Error('doSomethingError');
      error.source = 'myConnector';
      error.name = 'my_error';

      reject(error);
    });
  },

  doSomething: function(bearerToken, _importId, arg1, arg2) {
    return new Promise(function (fulfill, reject) {
      logger.info('running doSomething!');

      fulfill({bearerToken: bearerToken, _importId: _importId, arg1: arg1, arg2: arg2, functionName: 'doSomething'});
    });
  }
}

var exp = {
  doSomethingError: function(bearerToken, _exportId, arg1) {
    return new Promise(function (fulfill, reject) {
      logger.info('running doSomethingError!');

      var error = new Error('doSomethingError');
      error.source = 'connector';
      error.name = 'my_error';

      reject(error);
    });
  },

  doSomething: function(bearerToken, _exportId, arg1, arg2) {
    return new Promise(function (fulfill, reject) {
      logger.info('running doSomething!');
      fulfill({bearerToken: bearerToken, _exportId: _exportId, arg1: arg1, arg2: arg2, functionName: 'doSomething'});
    });
  }
}

exports.setup = setup;
exports.processSettings = processSettings;
exports.import = imp;
exports.export = exp;
