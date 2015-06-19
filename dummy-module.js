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

var settings = {
  persistSettings: function(options, callback) {
    logger.info('running persistSettings!');
    if (options.error) {
      return callback(new Error('persistSettings'));
    }

    options.functionName = 'persistSettings';
    return callback(null, options);
  },

  refreshMetadata: function(options, callback) {
    logger.info('running settings refreshMetadata!');

    options.functionName = 'refreshMetadata';
    return callback(null, options);
  }
}

var hooks = {
  doSomethingError: function(options, callback) {
    logger.info('running hooks doSomethingError!');

    var error = new Error('doSomethingError');
    error.name = 'my_error';

    return callback(error);
  },

  doSomething: function(options, callback) {
    logger.info('running hooks doSomething!');

    options.functionName = 'doSomething';
    return callback(null, [options]);
  },

  echoResponse: function(options, callback) {
    logger.info('running hooks echoResponse!');
    return callback(null, options.resp);
  },

  respondWithNonSearializableObject: function(options, callback) {
    logger.info('running hooks respondWithNonStringifiableObject!');

    return callback(null, {
      a: 'b',
      date: new Date()
    });
  }
}

exports.setup = setup;
exports.settings = settings;
exports.hooks = hooks;
