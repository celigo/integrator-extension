var extension = require('../../../lib/main')
var lambdaExtension = extension.lambda
var testModule = require('./testModule')

var options = {
  diy: testModule,
  connectors: {
    'connector1': testModule,
    'connector2': testModule
  }
}

exports.handler = lambdaExtension.createHandler(options)
