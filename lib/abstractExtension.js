'use strict'

var errors = require('./errors')
var util = require('./util')
var isEmpty = require('lodash.isempty')

function AbstractExtension () {
  var configuration
}

AbstractExtension.prototype.getConfiguration = function () {
  return this.configuration
}

var validateConfiguration = function (config, callback) {
  if (!config || isEmpty(config)) return callback(errors.getError('CONFIG_OPTIONS_NOT_PROVIDED'))

  if (!config.diy && !config.connectors) {
    return callback(errors.getError('CONFIG_SET_DIY_OR_CONNECTORS'))
  }

  if (config.connectors && isEmpty(config.connectors)) {
    return callback(errors.getError('CONFIG_NO_CONNECTORS_PROVIDED'))
  }

  return this.validateConfigurationSpecifics(config, callback)
}

// Override this method to validate any extra configuration properties. Return validation error
// if any using the callback passed to the method.
AbstractExtension.prototype.validateConfigurationSpecifics = function (config, callback) {
  return callback()
}

AbstractExtension.prototype.loadConfiguration = function (config, callback) {
  var self = this
  validateConfiguration.call(this, config, function (err) {
    if (err) return callback(err)
    self.configuration = config

    console.log('Loaded integrator-extension configuration.')
    if (self.configuration.diy) console.log('Loaded DIY module.')
    if (self.configuration.connectors) {
      for (var _connectorId in self.configuration.connectors) {
        if (self.configuration.connectors.hasOwnProperty(_connectorId)) {
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

  if (!extensionOptions.type) {
    errorList.push(errors.get('EXTENSION_MISSING_TYPE_FIELD'))
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
AbstractExtension.prototype.validateOptionsSpecifics = function (functionOptions, extensionOptions) {
  return []
}

AbstractExtension.prototype.callFunction = function (functionOptions, extensionOptions, callback) {
  var errorList = validateOptions.call(this, functionOptions, extensionOptions)
  if (errorList.length > 0) return callback({statusCode: 422, errors: errorList})

  var configuration = this.getConfiguration()
  var functionName = extensionOptions.function
  var module = extensionOptions.diy ? configuration.diy : configuration.connectors[extensionOptions._connectorId]
  var object = module[util.getObjectName(extensionOptions.type)]
  if (!object) {
    return callback({statusCode: 422, errors: [{ message: 'The object ' + extensionOptions.type + " doesn't exist in the module.", code: 'object_not_found' }]})
  }
  var func = object[functionName]

  if (!util.isFunction(func)) {
    return callback({statusCode: 422, errors: [errors.get('EXTENSION_INCORRECT_FUNCTION')]})
  }

  func(functionOptions, function (err, result) {
    if (err) {
      var error = {
        message: err.message,
        code: err.code || err.name
      }
      return callback({statusCode: 422, errors: [error]})
    }

    var error = util.validateAndReturnResponse(extensionOptions.maxResponseSize, result)

    if (error) return callback({statusCode: 422, errors: [error]})
    return callback(null, result)
  })
}

module.exports = AbstractExtension
