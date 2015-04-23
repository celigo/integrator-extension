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
  json: false
};

var consoleTransportOpts = {
  colorize: true,
  timestamp :true,
  prettyPrint: true
};

var fileTransport = new logger.transports.DailyRotateFile(fileTransportOpts);
var consoleTransport = new logger.transports.Console(consoleTransportOpts);

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, consoleTransportOpts);

// Gives an error when module is installed in integrator
if (!logger.transports.DailyRotateFile) {
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

function processIntegrationRequest(req, res, endpoint) {
  var errors = [];

  var systemToken = findToken(req);
  if (systemToken !== nconf.get('INTEGRATOR_CONNECTOR_SYSTEM_TOKEN')) {
    errors.push({code: 'unauthorized', message: 'invalid system token'});
    res.set('WWW-Authenticate', 'invalid system token');
    return res.status(401).json({errors: errors});
  }

  var functionName = undefined;

  if (endpoint === 'setup') {
    functionName = req.body.function;
    if (!functionName) {
      errors.push({field: 'function', code: 'missing_required_field', message: 'missing required field in request'});
    }
  } else if (endpoint === 'settings') {
    functionName = 'processSettings';
  } else {
    errors.push({code: 'Invalid_endpoint', message: endpoint + 'is invalid'});
  }

  var bearerToken = req.body.bearerToken;
  if (!bearerToken) {
    errors.push({field: 'bearerToken', code: 'missing_required_field', message: 'missing required field in request'});
  }

  var _integrationId = req.body._integrationId;
  if (!_integrationId) {
    errors.push({field: '_integrationId', code: 'missing_required_field', message: 'missing required field in request'});
  }

  if (!req.body.repository || !req.body.repository.name) {
    errors.push({field: 'repository.name', code: 'missing_required_field', message: 'missing required field in request'});
  }

  // request errors
  if (errors.length > 0) {
    return res.status(422).json({errors: errors});
  }

  var repoName = req.body.repository.name;
  var func = undefined;

  if (endpoint === 'setup') {
    if (!connectors[repoName] || !connectors[repoName].setup || !connectors[repoName].setup[functionName]) {
      errors.push({code: 'missing_function', message: functionName + ' function not found'});
    } else {
      func = connectors[repoName].setup[functionName];
    }
  } else if (endpoint === 'settings'){
    if (!connectors[repoName] || !connectors[repoName]['processSettings']) {
      errors.push({code: 'missing_function', message: 'processSettings function not found'});
    } else {
      func = connectors[repoName]['processSettings'];
    }
  }

  // connector repo errors
  if (errors.length > 0) {
    return res.status(422).json({errors: errors});
  }

  func(bearerToken, _integrationId, req.body.postBody, function(err, resp) {
    if (err) {
      errors.push({code: err.name, message: err.message});
      return res.status(422).json({errors: errors});
    }

    res.json(resp);
  });
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
