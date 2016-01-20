'use strict'

/*jshint -W080 */
var fs = require('fs')
var nconf = require('nconf').argv().env();
var env = process.env.NODE_ENV

if(env === 'unittest') {
  if (fs.existsSync('./env/unittest.json')) {
    nconf.file('env/unittest.json');
  } else {
    // hard code default values as unittest.json won't exist when using extension as a test module from integrator
    nconf.defaults({
      'TEST_INTEGRATOR_EXTENSION_PORT': 7000,
      "INTEGRATOR_EXTENSION_SYSTEM_TOKEN": "TEST_INTEGRATOR_EXTENSION_SYSTEM_TOKEN"
    });
  }
} else if(env === 'travis') {
  nconf.file('env/travis.json');
} else if (!env || env !== 'production') {
  // default = development
  nconf.file('env/development.json');
  nconf.defaults({
    'NODE_ENV': 'development'
  });

  env = nconf.get('NODE_ENV');
}

// Important: Remove default limit of 5
var http = require('http')
http.globalAgent.maxSockets = Infinity
var https = require('https')
https.globalAgent.maxSockets = Infinity

var _ = require('lodash');
var express = require('express');
var app = express();
var logger = require('winston');
var expressWinston = require('express-winston');
var bodyParser = require('body-parser');
var sizeof = require('object-sizeof');
var extensionUtil = require('./util');

var modules = {
  'dummy-module': require('./dummy-module')
}

//TODO - revisit this
if (env === 'production') {
  modules['techServices'] = require('tech-services-iio');
}

var port = nconf.get('TEST_INTEGRATOR_EXTENSION_PORT') || 80

// configure logging.  pretty ugly code but dont know better way yet
var fileTransportOpts = {
  filename: './server.log',
  maxsize: 10000000,
  maxFiles: 2,
  json: false,
  handleExceptions: (env === 'production')
};

var consoleTransportOpts = {
  colorize: true,
  timestamp :true,
  prettyPrint: true
};

var fileTransport = new logger.transports.DailyRotateFile(fileTransportOpts);
var consoleTransport = new logger.transports.Console(consoleTransportOpts);

// Gives an error when module is installed in integrator for testing
// Add loggers only when not running as a module
if (__dirname.indexOf('node_modules') === -1) {
  logger.remove(logger.transports.Console);
  logger.add(logger.transports.Console, consoleTransportOpts);
  logger.add(logger.transports.DailyRotateFile, fileTransportOpts);
}

expressWinston.requestWhitelist.splice(0, expressWinston.requestWhitelist.length);
expressWinston.requestWhitelist.push('method');
expressWinston.requestWhitelist.push('url');
expressWinston.requestWhitelist.push('query');

var message = "{{res.statusCode}} HTTP {{req.method}} {{req.url}} {{res.responseTime}}ms"
var expressWinstonLogger = expressWinston.logger({
  transports: [fileTransport, consoleTransport],
  msg: message,
  meta: false
});

var expressWinstonErrorLogger = expressWinston.errorLogger({
  transports: [fileTransport, consoleTransport],
  msg: message,
  meta: false
});

// we need the logs from all our 3rd party modules.
logger.extend(console);
var log = console.log;
console.log = function hijacked_log(level) {
  if (arguments.length > 1 && level in this) {
    log.apply(this, arguments);
  } else {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('info');
    log.apply(this, args);
  }
}

app.use(bodyParser.json({limit: '5mb'}));
app.use(expressWinstonLogger);
app.use(expressWinstonErrorLogger);

//routes
app.get('/', function (req, res) {
  res.send('I am doing good!');
});

app.get('/healthCheck', function (req, res) {
  res.send('I am doing good!');
});

app.post('/function', function (req, res) {
  var errors = validateRequest(req, modules);

  if (errors.length > 0) {
    if (errors[0].code === 'unauthorized') {
      res.set('WWW-Authenticate', 'invalid system token');
      return res.status(401).json({errors: errors});
    }

    return res.status(422).json({errors: errors});
  }

  var moduleName = req.body.module;
  var func = undefined;
  var isFunction = false;

  // find function
  var obj = modules[moduleName];
  for (var i = 0; i < req.body.function.length; i++) {
    var prop = req.body.function[i];

    if (!obj[prop]) {
      errors.push({code: 'missing_function', message: prop + ' not found', source: 'adaptor'});
      break;
    }

    obj = obj[prop];

    if (i === (req.body.function.length-1)) {
      func = obj;
      if (!_.isFunction(func) ) {
        errors.push({code: 'missing_function', message: prop + ' is not a function', source: 'adaptor'});
      }
    }
  }

  if (errors.length > 0) {
    return res.status(422).json({errors: errors});
  }

  func(req.body.postBody, function(err, result) {
    if (err) {
      errors.push({code: err.name, message: err.message});
      return res.status(422).json({errors: errors});
    }

    var validationError = validateFunctionResponse(req.body, result);

    if (validationError) {
      errors.push({code: validationError.name, message: validationError.message});
      return res.status(422).json({errors: errors});
    }

    res.json(result);
  });
});

function validateFunctionResponse(reqBody, result) {
  //If maxResponsSize not sent in request then set a limit of 5MB
  var maxResponsSize = reqBody.maxResponsSize || (5 * 1024 * 1024);
  var error

  if (sizeof(result) > maxResponsSize) {
    error = new Error('response stream exceeded limit of ' + maxResponsSize + ' bytes.');
    error.name = 'response_size_exceeded';

    return error;
  }

  if (!extensionUtil.isSerializable(result)) {
    error = new Error('extension response is not serializable.');
    error.name = 'invalid_extension_response';

    return error;
  }

  return null;
}


function validateRequest(req, modules) {
  var errors = [];

  var systemToken = findToken(req);
  if (systemToken !== nconf.get('INTEGRATOR_EXTENSION_SYSTEM_TOKEN')) {
    errors.push({code: 'unauthorized', message: 'invalid system token', source: 'adaptor'});
    return errors;
  }

  if (!req.body.postBody) {
    errors.push({field: 'postBody', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
  }

  if (!req.body.module) {
    errors.push({field: 'module', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
  } else if (!modules[req.body.module]) {
    errors.push({code: 'module_not_found', message: req.body.module + ' module not found', source: 'adaptor'});
  }

  if (!req.body.function) {
    errors.push({field: 'function', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
  } else if (!_.isArray(req.body.function)) {
    errors.push({field: 'function', code: 'invalid_field', message: 'function must be an array', source: 'adaptor'});
  } else if (req.body.function.length === 0) {
    errors.push({field: 'function', code: 'invalid_field', message: 'function length must be more than zero', source: 'adaptor'});
  }

  return errors;
}

logger.info('NODE_ENV: ' + nconf.get('NODE_ENV'));
var server = app.listen(port, function () {
  logger.info('integrator-extension server listening on port ' + port);
});

// our load balancer "Idle Timeout" is currently set to 300 seconds.
// this timeout should be just slightly larger to avoid 504 errors.
server.timeout = 315000;

function findToken(req) {
  var token;
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0]
        , credentials = parts[1];
      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    }
  } else if (req.body && req.body.access_token) {
    token = req.body.access_token;
  } else if (req.query && req.query.access_token) {
    token = req.query.access_token;
  }

  return token;
}
