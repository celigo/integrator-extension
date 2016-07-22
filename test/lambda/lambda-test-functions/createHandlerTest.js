var lambdaExtension = require('../../../lib/main').lambda

var options = {}
exports.options = options

exports.handler = lambdaExtension.createHandler(options)
