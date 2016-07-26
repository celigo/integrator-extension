var extension = require('../../../lib/main')
var lambdaExtension = extension.lambda

var options = {}
exports.options = options

exports.handler = lambdaExtension.createHandler(options)
