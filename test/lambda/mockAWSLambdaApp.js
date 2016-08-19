var isEmpty = require('lodash.isempty')
var regions = ['us-east-1', 'us-west-2', 'ap-southeast-2', 'ap-northeast-1', 'eu-central-1', 'eu-central-1']
var testFunctions = require('./lambda-test-functions')

function AWS () {
  var awsUsers = {
    'key1728': {
      secretAccessKey: '12^3',
      lambda: {
        'us-east-1': {
          hooksWrappersTest: testFunctions.hooksWrappersTest,
          createHandlerTest: testFunctions.createHandlerTest,
          invokeFunctionTest: testFunctions.invokeFunctionTest
        }
      }
    }
  }

  function validateAWSParams (params, callback) {
    if (!params || isEmpty(params)) {
      return callback(createError('Missing region in config', 'ConfigError'))
    }

    var userDetails = awsUsers[params.accessKeyId]

    if (!userDetails) {
      return callback(createError('The security token included in the request is invalid.', 'UnrecognizedClientException', 403))
    }

    if (regions.indexOf(params.region) === -1) {
      return callback(createError('Lambda not yet supported in region:' + params.region, 'UnknownEndpoint'))
    }

    if (userDetails.secretAccessKey !== params.secretAccessKey) {
      return callback(createError('Invalid secretAccessKey', 'invalidSecretAccessKey', 403))
    }

    return callback(null, userDetails['lambda'])
  }

  return {
    Lambda: function (awsParams) {
      return {
        invoke: function (params, callback) {
          validateAWSParams(awsParams, function (err, lambdaFunctions) {
            if (err) return callback(err)

            var functionToInvoke = lambdaFunctions[awsParams.region][params.FunctionName]
            if (!functionToInvoke) {
              return callback(createError('Function: ' + params.FunctionName + ' is not found', 'ResourceNotFoundException', 404))
            }
            try {
              var clientContext = JSON.parse(new Buffer(params.ClientContext, 'base64').toString('ascii'))
              var payload = JSON.parse(params.Payload)
            } catch (e) {
              return callback(e)
            }

            var context = {clientContext: clientContext}
            return functionToInvoke.handler(payload, context, function (err, data) {
              var toReturnData = {
                StatusCode: 200
              }
              if (err) {
                toReturnData.FunctionError = 'Handled'
                toReturnData.Payload = JSON.stringify({errorMessage: err})
              } else {
                toReturnData.Payload = JSON.stringify(data)
              }

              return callback(null, toReturnData)
            })
          })
        }
      }
    }
  }
}

function createError (message, code, statusCode) {
  var err = new Error(message)
  err.code = code
  err.statusCode = statusCode
  return err
}

module.exports = AWS()
