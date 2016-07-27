var MockAWS = require('./mockAWSLambdaApp')

var lambda = new MockAWS.Lambda({
  accessKeyId: 'key1728',
  secretAccessKey: '12^3',
  region: 'us-east-1'
})

function invokeFunction (options, extensionProperties, AWSFunctionName, callback) {
  var encodedClientContext = new Buffer(JSON.stringify(extensionProperties)).toString('base64')
  var params = {
    FunctionName: AWSFunctionName,
    ClientContext: encodedClientContext,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(options)
  }

  lambda.invoke(params, callback)
}

function validateErrorRetured (data, errorJSON, callback) {
  data.StatusCode.should.equal(200)
  data.FunctionError.should.equal('Handled')
  var body = JSON.parse(data.Payload)
  var errorMessage = JSON.parse(body.errorMessage)
  errorMessage.statusCode.should.equal(422)
  errorMessage.errors.should.eql(errorJSON)
  callback()
}

module.exports.invokeFunction = invokeFunction
module.exports.validateErrorRetured = validateErrorRetured
