var nconf = require('nconf').argv().env();
if (process.env.NODE_ENV !== 'production') {
  nconf.defaults({
    'TEST_INTEGRATOR_CONNECTOR_PORT': 7000,
    "TEST_INTEGRATOR_CONNECTOR_BEARER_TOKEN": "TEST_INTEGRATOR_CONNECTOR_BEARER_TOKEN",
    "INTEGRATOR_CONNECTOR_SYSTEM_TOKEN": "TEST_INTEGRATOR_CONNECTOR_SYSTEM_TOKEN"
  });
}

var express = require('express');
var app = express();
var logger = require('winston');
var expressWinston = require('express-winston');
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var sizeof = require('object-sizeof');
var deepIs = require('deep-is');

var connectors = {
  'dummy-connector': require('./dummy-connector')
}

if (process.env.NODE_ENV === 'production') {
  connectors['netsuite-zendesk-connector'] = require('netsuite-zendesk-connector');
}

var port = nconf.get('TEST_INTEGRATOR_CONNECTOR_PORT') || 80;

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
  var _objectId = undefined;
  var repoName = req.body.repository.name;
  var postBodyArgs = [];
  var func = undefined;
  var isFunction = false;

  if (endpoint === 'setup') {
    _objectId = req.body._integrationId;
    if (!_objectId) {
      errors.push({field: '_integrationId', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
    }

    functionName = req.body.function;
    if (!functionName) {
      errors.push({field: 'function', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
    } else {

      if (!connectors[repoName] || !connectors[repoName].setup || !connectors[repoName].setup[functionName]) {
        errors.push({code: 'missing_function', message: functionName + ' function not found', source: 'adaptor'});
      } else {
        func = connectors[repoName].setup[functionName];
      }
    }

    postBodyArgs.push(req.body.postBody);
  } else if (endpoint === 'settings') {
    _objectId = req.body._integrationId;
    if (!_objectId) {
      errors.push({field: '_integrationId', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
    }

    functionName = 'processSettings';
    if (!connectors[repoName] || !connectors[repoName][functionName]) {
      errors.push({code: 'missing_function', message: functionName + ' function not found', source: 'adaptor'});
    } else {
      func = connectors[repoName][functionName];
    }

    postBodyArgs.push(req.body.postBody);
  } else if (endpoint === 'function') {
    isFunction = true;

    if (!req.body.maxPageSize) {
      errors.push({code: 'missing_required_field', message: 'maxPageSize must be sent in the request', source: 'adaptor'});
    }

    if (!req.body._exportId && !req.body._importId) {
      errors.push({code: 'missing_required_field', message: '_importId or _exportId must be sent in the request', source: 'adaptor'});
    } else if (req.body._exportId && req.body._importId) {
      errors.push({code: 'invalid_request', message: 'both _importId and _exportId must not be sent together', source: 'adaptor'});
    } else {

      functionName = req.body.function;
      if (!functionName) {
        errors.push({field: 'function', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
      } else {

        if (req.body._exportId) {
          _objectId = req.body._exportId;

          if (!connectors[repoName] || !connectors[repoName].export || !connectors[repoName].export[functionName]) {
            errors.push({code: 'missing_function', message: functionName + ' function not found', source: 'adaptor'});
          } else {
            func = connectors[repoName].export[functionName];
          }
        } else if (req.body._importId) {
          _objectId = req.body._importId;

          if (!connectors[repoName] || !connectors[repoName].import || !connectors[repoName].import[functionName]) {
            errors.push({code: 'missing_function', message: functionName + ' function not found', source: 'adaptor'});
          } else {
            func = connectors[repoName].import[functionName];
          }
        }

        if (!Array.isArray(req.body.postBody)) {
          errors.push({code: 'invalid_args', message: 'postBody must be an array', source: 'adaptor'});
        } else if (req.body.postBody.length === 0 || !Array.isArray(req.body.postBody[0])) {
          errors.push({code: 'invalid_args', message: 'first argument must be an array', source: 'adaptor'});
        } else {
          postBodyArgs = req.body.postBody;
        }
      }
    }
  } else {
    errors.push({code: 'invalid_endpoint', message: endpoint + 'is invalid', source: 'adaptor'});
  }

  if (errors.length > 0) {
    return res.status(422).json({errors: errors});
  }

  var args = [req.body.bearerToken, _objectId];
  Array.prototype.push.apply(args, postBodyArgs);

  func.apply(null, args).then(function(result) {

    if (isFunction) {
      validateConnectorFunctionResponse(req.body, result);
    }

    res.json(result);
  }).catch(function(err) {
    errors.push({code: err.name, message: err.message, source: '_connector'});
    return res.status(422).json({errors: errors});
  });
}

function validateConnectorFunctionResponse(reqBody, result) {
  if (sizeof(result) > reqBody.maxPageSize) {
    var error = new Error('hook response object size exceeds max page size ' + reqBody.maxPageSize);
    error.name = 'invalid_hook_response';

    throw error;
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

    throw error;
  }
}


function validateReq(req) {
  var errors = [];

  var systemToken = findToken(req);
  if (systemToken !== nconf.get('INTEGRATOR_CONNECTOR_SYSTEM_TOKEN')) {
    errors.push({code: 'unauthorized', message: 'invalid system token', source: 'adaptor'});
    return errors;
  }

  var bearerToken = req.body.bearerToken;
  if (!bearerToken) {
    errors.push({field: 'bearerToken', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
  }

  if (!req.body.repository || !req.body.repository.name) {
    errors.push({field: 'repository.name', code: 'missing_required_field', message: 'missing required field in request', source: 'adaptor'});
  }

  return errors;
}

var server = app.listen(port, function () {
  logger.info('integrator-connector server listening on port ' + port);
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
