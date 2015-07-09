var logger = require('winston')

var setup = {
  initialize: function(options, callback) {
    logger.info('running setup initialize!')

    options.function = 'initialize'
    return callback(null, options)
  },

  runSetupErrorStep: function(options, callback) {
    logger.info('running runSetupErrorStep!')
    return callback(new Error('runSetupErrorStep'))
  },

  runSetupSuccessStep: function(options, callback) {
    logger.info('running runSetupSuccessStep!')

    options.function = 'runSetupSuccessStep'
    return callback(null, options)
  },

  notAFunction: 'not_a_func'
}

var settings = {
  persistSettings: function(options, callback) {
    logger.info('running persistSettings!')
    if (options.error) {
      return callback(new Error('persistSettings'))
    }

    options.function = 'persistSettings'
    return callback(null, options)
  },

  refreshMetadata: function(options, callback) {
    logger.info('running settings refreshMetadata!')

    options.function = 'refreshMetadata'
    return callback(null, options)
  }
}

var hooks = {
  doSomethingError: function(options, callback) {
    logger.info('running hooks doSomethingError!')

    var error = new Error('doSomethingError')
    error.name = 'my_error'

    return callback(error)
  },

  doSomething: function(options, callback) {
    logger.info('running hooks doSomething!')

    options.function = 'doSomething'
    return callback(null, [options])
  },

  echoResponse: function(options, callback) {
    logger.info('running hooks echoResponse!')
    return callback(null, options.resp)
  },

  respondWithNonSearializableObject: function(options, callback) {
    logger.info('running hooks respondWithNonStringifiableObject!')

    return callback(null, {
      a: 'b',
      date: new Date()
    })
  }
}

var hooks = {
  doSomethingError: function(options, callback) {
    logger.info('running hooks doSomethingError!')

    var error = new Error('doSomethingError')
    error.name = 'my_error'

    return callback(error)
  },

  doSomething: function(options, callback) {
    logger.info('running hooks doSomething!')

    options.function = 'doSomething'
    return callback(null, [options])
  },

  echoResponse: function(options, callback) {
    logger.info('running hooks echoResponse!')
    return callback(null, options.resp)
  },

  respondWithNonSearializableObject: function(options, callback) {
    logger.info('running hooks respondWithNonStringifiableObject!')

    return callback(null, {
      a: 'b',
      date: new Date()
    })
  }
}

var wrappers = {
  pingOptions: function(options, callback) {
    logger.info('running wrappers pingOptions!')
    options.statusCode = 200
    return callback(null, options)
  },

  pingSuccess: function(options, callback) {
    logger.info('running wrappers pingSuccess!')
    return callback(null, {statusCode: 200})
  },

  pingError: function(options, callback) {
    logger.info('running wrappers pingError!')
    return callback(null, {statusCode: 401, errors: [{code: 'pingCode', message: 'pingMessage'}]})
  },

  importOptions: function(options, callback) {
    logger.info('running wrappers importOptions!')

    //lets pass the options back via id for validation!
    return callback(null, [{statusCode: 200, id: options}])
  },

  returnVariousImportResponses: function(options, callback) {
    logger.info('running wrappers returnVariousImportResponses!')

    var toReturn = [
        {statusCode: 200}
      , {statusCode: 200, id:'myId1'}
      , {statusCode: 200, id:'myId2', errors: [{code:'c1', message: 'm1'}]}
      , {statusCode: 422, errors: [{code:'c1', message: 'm1'}]}
      , {statusCode: 401, errors: [{code:'c2', message: 'm2'}]}
    ]

    return callback(null, toReturn)
  },
}

exports.setup = setup
exports.settings = settings
exports.hooks = hooks
exports.wrappers = wrappers
