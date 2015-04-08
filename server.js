var nconf = require('nconf').argv().env();
if (process.env.NODE_ENV !== 'production') {
  nconf.file('env/development.json');
  nconf.defaults({
    'NODE_ENV': 'development'
  });
}

var express = require('express');
var app = express();
var logger = require('winston');
var expressWinston = require('express-winston');

var port = nconf.get('IC_PORT') || 80;

//routes
app.get('/', function (req, res) {
  res.send('I am doing good!');
});

app.post('/v1/setup', function (req, res) {
  res.send('I am doing good!');
});

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

logger.remove(logger.transports.Console)
.add(logger.transports.Console, consoleTransportOpts)
.add(logger.transports.DailyRotateFile, fileTransportOpts);

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

app.use(expressWinstonLogger);
app.use(expressWinstonErrorLogger);

var server = app.listen(port, function () {
  logger.info('Express server listening on port ' + app.get('port'));
  logger.info('NODE_ENV: ' + nconf.get('NODE_ENV'));
});
