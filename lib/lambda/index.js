'use strict'

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

      return handler.invokeFunction(event, context, callback)
    })
  }
}

exports.createHandler = createHandler
