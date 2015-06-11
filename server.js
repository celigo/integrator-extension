var nconf = require('nconf').argv().env();
if (process.env.NODE_ENV !== 'production') {
  nconf.defaults({
    'TEST_INTEGRATOR_EXTENSION_PORT': 7000,
    "TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN": "TEST_INTEGRATOR_EXTENSION_BEARER_TOKEN",
    "INTEGRATOR_EXTENSION_SYSTEM_TOKEN": "TEST_INTEGRATOR_EXTENSION_SYSTEM_TOKEN"
  });
}

// Important: Remove default limit of 5
var http = require('http')
http.globalAgent.maxSockets = Infinity
var https = require('https')
https.globalAgent.maxSockets = Infinity

var express = require('express');
var app = express();
var logger = require('winston');
var expressWinston = require('express-winston');
var bodyParser = require('body-parser');
var sizeof = require('object-sizeof');
var deepIs = require('deep-is');

var modules = {
  'dummy-module': require('./dummy-module')
}

if (process.env.NODE_ENV === 'production') {
  modules['netsuite-zendesk-connector'] = require('netsuite-zendesk-connector');
}

var port = nconf.get('TEST_INTEGRATOR_EXTENSION_PORT') || 80;

// configure logging.  pretty ugly code but dont know better way yet
var fileTransportOpts = {
  filename: './server.log',
  maxsize: 10000000,
  maxFiles: 2,
  json: false,
  handleExceptions: (process.env.NODE_ENV === 'production')
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
var expressWinstonLogger = expressWinston.logger({
  transports: [
    fileTransport,
    consoleTransport
  ]
});
var expressWinstonErrorLogger = expressWinston.errorLogger({
  transports: [
    fileTransport,
    consoleTransport
  ]
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

app.use(bodyParser.json());
app.use(expressWinstonLogger);
app.use(expressWinstonErrorLogger);

//routes
app.get('/', function (req, res) {
  res.send('I am doing good!');
});

app.get('/healthCheck', function (req, res) {
  res.send('I am doing good!');
});

app.put('/setup', function (req, res) {
  processIntegrationRequest(req, res, 'setup');
});

app.put('/settings', function (req, res) {
  processIntegrationRequest(req, res, 'settings');
});

app.post('/function', function (req, res) {
  processIntegrationRequest(req, res, 'function');
});

function processIntegrationRequest(req, res, endpoint) {
  var errors = validateReq(req);

  if (errors.length > 0) {
    if (errors[0].code === 'unauthorized') {
      res.set('WWW-Authenticate', 'invalid system token');
      return res.status(401).json({errors: errors});
    }

    return res.status(422).json({errors: errors});
  }

  var functionName = undefined;
  var moduleName = req.body.module;
  var func = undefined;
  var isFunction = false;

  if (endpoint === 'setup') {
    functionName = req.body.function;
    if (!functionName) {
      errors.push({field: 'function', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
    } else {

      if (!modules[moduleName] || !modules[moduleName].setup || !modules[moduleName].setup[functionName]) {
        errors.push({code: 'missing_function', message: functionName + ' function not found', source: 'adaptor'});
      } else {
        func = modules[moduleName].setup[functionName];
      }
    }

  } else if (endpoint === 'settings') {
    functionName = 'processSettings';
    if (!modules[moduleName] || !modules[moduleName][functionName]) {
      errors.push({code: 'missing_function', message: functionName + ' function not found', source: 'adaptor'});
    } else {
      func = modules[moduleName][functionName];
    }

  } else if (endpoint === 'function') {
    isFunction = true;

    if (!req.body.maxPageSize) {
      errors.push({code: 'missing_required_field', message: 'maxPageSize must be sent in the request', source: 'adaptor'});
    }

    if (!req.body.postBody._exportId && !req.body.postBody._importId) {
      errors.push({code: 'missing_required_field', message: '_importId or _exportId must be sent in the request', source: 'adaptor'});
    } else if (req.body.postBody._exportId && req.body.postBody._importId) {
      errors.push({code: 'invalid_request', message: 'both _importId and _exportId must not be sent together', source: 'adaptor'});
    } else {

      functionName = req.body.function;
      if (!functionName) {
        errors.push({field: 'function', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
      } else {

        if (req.body.postBody._exportId) {

          if (!modules[moduleName] || !modules[moduleName].export || !modules[moduleName].export[functionName]) {
            errors.push({code: 'missing_function', message: functionName + ' function not found', source: 'adaptor'});
          } else {
            func = modules[moduleName].export[functionName];
          }
        } else if (req.body.postBody._importId) {

          if (!modules[moduleName] || !modules[moduleName].import || !modules[moduleName].import[functionName]) {
            errors.push({code: 'missing_function', message: functionName + ' function not found', source: 'adaptor'});
          } else {
            func = modules[moduleName].import[functionName];
          }
        }

      }
    }
  } else {
    errors.push({code: 'invalid_endpoint', message: endpoint + 'is invalid', source: 'adaptor'});
  }

  if (errors.length > 0) {
    return res.status(422).json({errors: errors});
  }

  func(req.body.postBody, function(err, result) {
    if (err) {
      errors.push({code: err.name, message: err.message});
      return res.status(422).json({errors: errors});
    }

    if (isFunction) {
      var validationError = validateModuleFunctionResponse(req.body, result);

      if (validationError) {
        errors.push({code: validationError.name, message: validationError.message});
        return res.status(422).json({errors: errors});
      }
    }

    res.json(result);
  });
}

//TODO -revisit name
function validateModuleFunctionResponse(reqBody, result) {
  if (sizeof(result) > reqBody.maxPageSize) {
    var error = new Error('hook response object size exceeds max page size ' + reqBody.maxPageSize);
    error.name = 'invalid_hook_response';

    return error;
  }

  try {
    var stringifiedResult = JSON.stringify(result);
    var reconstructedResult = JSON.parse(stringifiedResult);

    if (!deepIs(result, reconstructedResult)) {
      var error = new Error('stringified/parsed object not same as original');
      error.name = 'invalid_hook_response';
      throw error;
    }

  } catch (e) {
    var error = new Error('hook response object not serializable [' + e.message + ']');
    error.name = e.name;

    return error;
  }

  return null;
}


function validateReq(req) {
  var errors = [];

  var systemToken = findToken(req);
  if (systemToken !== nconf.get('INTEGRATOR_EXTENSION_SYSTEM_TOKEN')) {
    errors.push({code: 'unauthorized', message: 'invalid system token', source: 'adaptor'});
    return errors;
  }

  if (!req.body.postBody) {
    errors.push({field: 'postBody', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
  } else {

    if (!req.body.postBody.bearerToken) {
      errors.push({field: 'bearerToken', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
    }
  }

  if (!req.body.module) {
    errors.push({field: 'module', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
  }

  return errors;
}

var server = app.listen(port, function () {
  logger.info('integrator-extension server listening on port ' + port);
  logger.info('NODE_ENV: ' + nconf.get('NODE_ENV'));
});

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
