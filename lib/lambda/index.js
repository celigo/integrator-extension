'use strict'

var logger = require('winston')
var _ = require('lodash')
var handler = require('./handler')
var extension = require('./extension')

function createHandler (config) {
  return function (event, context, callback) {
    extension.loadConfiguration(config, function (err) {
      if (err) {
        var error = {
          message: err.message,
          code: err.code
        }
        return callback(JSON.stringify({statusCode: 422, errors: [error]}))
      }

      logger.info('lambda-integrator-extension configuration is loaded.')
      if (config.diy) logger.info('Loaded DIY module.')
      if (config.connectors) {
        _.forEach(config.connectors, function (value, _connectorId) {
          logger.info('Loaded connector module for _connectorId: ' + _connectorId)
        })
      }
      return handler.invokeFunction(event, context, callback)
    })
  }
}

exports.createHandler = createHandler
