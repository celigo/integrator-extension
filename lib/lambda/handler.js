'use strict'

var lambdaExtension = require('./extension')

function invokeFunction (event, context, callback) {
  lambdaExtension.callFunction(event, context.clientContext, function (err, result) {
    if (err) return callback(JSON.stringify(err))
    return callback(null, result)
  })
}

exports.invokeFunction = invokeFunction
