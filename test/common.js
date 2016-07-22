var logger = require('winston')

var consoleTransportOpts = {
  colorize: true,
  timestamp: true,
  prettyPrint: true
}

logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, consoleTransportOpts)
