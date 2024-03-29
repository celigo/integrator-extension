'use strict'

var nodeUtil = require('util')

var errors = require('./errors')
var util = require('./util')
var isEmpty = require('lodash.isempty')

function Extension () {}

var configuration

Extension.prototype.getConfiguration = function () {
  return configuration
}

var validateConfiguration = function (config, callback) {
  if (!config || isEmpty(config)) return callback(errors.getError('CONFIG_OPTIONS_NOT_PROVIDED'))

  if (!config.diy && !config.connectors) {
    return callback(errors.getError('CONFIG_SET_DIY_OR_CONNECTORS'))
  }

  if (config.diy && config.connectors) {
    return callback(errors.getError('CONFIG_DIY_AND_CONNECTORS_EXIST'))
  }

  if (config.connectors && isEmpty(config.connectors)) {
    return callback(errors.getError('CONFIG_NO_CONNECTORS_PROVIDED'))
  }

  return this.validateConfigurationSpecifics(config, callback)
}

// Override this method to validate any extra configuration properties. Return validation error
// if any using the callback passed to the method.
Extension.prototype.validateConfigurationSpecifics = function (config, callback) {
  return callback()
}

Extension.prototype.loadConfiguration = function (config, callback) {
  validateConfiguration.call(this, config, function (err) {
    if (err) return callback(err)
    configuration = config

    console.log('Loaded integrator-extension configuration.')
    if (configuration.diy) console.log('Loaded DIY module.')
    if (configuration.connectors) {
      for (var _connectorId in configuration.connectors) {
        if (configuration.connectors.hasOwnProperty(_connectorId)) {
          console.log('Loaded connector module for _connectorId: ' + _connectorId)
        }
      }
    }
    return callback()
  })
}

var validateOptions = function (functionOptions, extensionOptions) {
  var errorList = []

  var configuration = this.getConfiguration()
  if (extensionOptions.diy) {
    if (!configuration.diy) {
      errorList.push(errors.get('EXTENSION_DIY_DOESNT_EXIST'))
    }
  } else if (extensionOptions._connectorId) {
    if (!configuration.connectors || !configuration.connectors[extensionOptions._connectorId]) {
      errorList.push(errors.get('EXTENSION_CONNECTOR_ID_DOESNT_EXIST'))
    }
  } else {
    errorList.push(errors.get('EXTENSION_REQUIRED_DIY_OR_CONNECTOR_ID_FIELD'))
  }

  if (!extensionOptions.function) {
    errorList.push(errors.get('EXTENSION_MISSING_FUNCTION_FIELD'))
  } else if (typeof extensionOptions.function !== 'string') {
    errorList.push(errors.get('EXTENSION_FUNCTION_TYPE_STRING'))
  }

  if (!functionOptions) {
    errorList.push(errors.get('EXTENSION_MISSING_FUNCTION_OPTIONS'))
  }

  var specificsErrorList = this.validateOptionsSpecifics(functionOptions, extensionOptions)
  if (!Array.isArray(specificsErrorList)) {
    throw new Error('validateOptionsSpecifics is expected to return an array.')
  }

  return errorList.concat(specificsErrorList)
}

// Override this method to validate any extra function and extension properties. Return an array of
// objects where each object is of the format: {code: '<error_code>', message: '<error_message>'} if
// any of the validation fails else an empty array.
Extension.prototype.validateOptionsSpecifics = function (functionOptions, extensionOptions) {
  return []
}

Extension.prototype.callFunction = function (functionOptions, extensionOptions, callback) {
  try {
    logFunctionMetadata(functionOptions, extensionOptions)
  } catch (err) {
    console.log('logName=failedToLogMetadata, err=%s', nodeUtil.inspect(err, { depth: 3 }))
  }
  var errorList = validateOptions.call(this, functionOptions, extensionOptions)
  if (errorList.length > 0) return callback({statusCode: 422, errors: errorList})

  var configuration = this.getConfiguration()
  var functionName = extensionOptions.function
  var module = extensionOptions.diy ? configuration.diy : configuration.connectors[extensionOptions._connectorId]
  var object = extensionOptions.type ? module[util.getObjectName(extensionOptions.type)] : module
  if (!object) {
    return callback({statusCode: 422, errors: [{ message: 'The object ' + extensionOptions.type + " doesn't exist in the module.", code: 'object_not_found' }]})
  }

  if (!util.isFunction(object[functionName])) {
    return callback({statusCode: 422, errors: [errors.get('EXTENSION_INCORRECT_FUNCTION')]})
  }

  if (functionOptions.lastExportDateTime) {
    try {
      functionOptions.lastExportDateTime = new Date(functionOptions.lastExportDateTime)
    } catch (err) {
      return callback({statusCode: 422, errors: [{ message: err.message, code: err.code }]})
    }
  }
  if (functionOptions.currentExportDateTime) {
    try {
      functionOptions.currentExportDateTime = new Date(functionOptions.currentExportDateTime)
    } catch (err) {
      return callback({statusCode: 422, errors: [{ message: err.message, code: err.code }]})
    }
  }

  // invoking the function from the object's context, this is to make sure if the
  // module is an instance of a function and instance propeties are used within
  // extension function, then those are evaluated with respect to the instance.
  object[functionName](functionOptions, function (err, result) {
    if (err) {
      var error = {
        message: err.message,
        code: err.code || err.name
      }
      return callback({statusCode: 422, errors: [error]})
    }

    var responseValidationError = util.validateAndReturnResponse(extensionOptions.maxResponseSize, result)

    if (responseValidationError) return callback({statusCode: 422, errors: [responseValidationError]})
    return callback(null, result)
  })
}

function logFunctionMetadata (functionOptions, extensionOptions) {
  var logMap = {}

  logMap.logName = 'callFunctionInvoked'
  logMap.type = extensionOptions.type
  logMap.function = extensionOptions.function
  logMap._connectorId = extensionOptions._connectorId
  if (functionOptions) {
    logMap._integrationId = functionOptions._integrationId
    if (extensionOptions.type === 'hook' || extensionOptions.type === 'wrapper') {
      logMap._flowId = functionOptions._flowId
      logMap._exportId = functionOptions._exportId
      logMap._importId = functionOptions._importId
      if (extensionOptions.type && extensionOptions.type === 'wrapper' && functionOptions.connection) {
        logMap._connectionId = functionOptions.connection._id
      } else if (functionOptions._connectionId) {
        logMap._connectionId = functionOptions.connectionId
      }
    }
  }
  logMap._reqId = extensionOptions._reqId
  logMap.traceId = extensionOptions.traceId
  var logInfo = ''
  for (var key of Object.keys(logMap)) {
    if (logMap.hasOwnProperty(key) && logMap[key] !== undefined) {
      logInfo += key + '=' + logMap[key] + ', '
    }
  }

  logInfo = logInfo.substring(0, (logInfo.length - 2))
  console.log(logInfo)
}

module.exports = Extension
