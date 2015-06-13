var logger = require('winston');

var setup = {
  initialize: function(options, callback) {
    logger.info('running setup initialize!');

    options.functionName = 'initialize';
    return callback(null, options);
  },

  runSetupErrorStep: function(options, callback) {
    logger.info('running runSetupErrorStep!');
    return callback(new Error('runSetupErrorStep'));
  },

  runSetupSuccessStep: function(options, callback) {
    logger.info('running runSetupSuccessStep!');

    options.functionName = 'runSetupSuccessStep';
    return callback(null, options);
  },

  notAFunction: 'not_a_func'
}

var processSettings = function(options, callback) {
  logger.info('running processSettings!');
  if (options.error) {
    return callback(new Error('processSettings'));
  }

  options.functionName = 'processSettings';
  return callback(null, options);
};

var hooks = {
  doSomethingError: function(options, callback) {
    logger.info('running import doSomethingError!');

    var error = new Error('doSomethingError');
    error.name = 'my_error';

    return callback(error);
  },

  doSomething: function(options, callback) {
    logger.info('running import doSomething!');

    options.functionName = 'doSomething';
    return callback(null, [options]);
  },

  echoResponse: function(options, callback) {
    logger.info('running import echoResponse!');
    return callback(null, options.resp);
  },

  respondWithNonSearializableObject: function(options, callback) {
    logger.info('running import respondWithNonStringifiableObject!');

    return callback(null, {
      a: 'b',
      date: new Date()
    });
  }
}

exports.setup = setup;
exports.processSettings = processSettings;
exports.import = hooks;
exports.export = hooks;
