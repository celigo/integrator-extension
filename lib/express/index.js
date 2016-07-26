'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var routes = require('./routes')
var http = require('http')
var https = require('https')
var errors = require('../errors')
var logger = require('winston')
var expressWinston = require('express-winston')
var extension = require('./extension')

var server, port

function createServer (config, callback) {
  if (server) return callback(errors.getError('SERVER_ALREADY_CREATED'))

  extension.loadConfiguration(config, function (err) {
    if (err) return callback(err)
    // Set default to Infinity
    http.globalAgent.maxSockets = config.maxSockets || Infinity
    https.globalAgent.maxSockets = config.maxSockets || Infinity

    var app = express()

    app.use(bodyParser.json({limit: '10mb'}))

    if (config.winstonInstance) logger = config.winstonInstance

    var expressLogConfig = {
      winstonInstance: logger,
      msg: '{{res.statusCode}} HTTP {{req.method}} {{req.url}} {{res.responseTime}}ms',
      meta: false
    }

    app.use(expressWinston.logger(expressLogConfig))
    app.use(expressWinston.errorLogger(expressLogConfig))

    routes(app)
    port = config.port || 80

    server = app.listen(port, function () {
      logger.info('Express integrator-extension server listening on port: ' + port)
      return callback()
    })

    server.on('error', function (err) {
      logger.error('Express integrator-extension server error - ' + err.toString())
    })

    // Timeout should be greater than the server's/load balancer's idle timeout to avoid 504 errors.
    server.timeout = config.timeout || 315000
  })
}

function stopServer (callback) {
  if (!server) return callback(errors.getError('SERVER_NOT_FOUND'))
  server.close(function (err) {
    if (err) return callback(err)
    server = undefined

    logger.info('Express integrator-extension server stopped listening on port: ' + port)
    return callback()
  })
}

exports.createServer = createServer
exports.stopServer = stopServer
