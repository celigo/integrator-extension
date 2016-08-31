'use strict'

var errors = {
  EXTENSION_MISSING_TYPE_FIELD: {
    code: 'missing_required_field',
    message: 'Missing required field type in the extension options.'
  },

  EXTENSION_MISSING_OPTIONS_FIELD: {
    code: 'missing_required_field',
    message: 'Missing required field options in the extension options.'
  },

  EXTENSION_MISSING_FUNCTION_FIELD: {
    code: 'missing_required_field',
    message: 'Missing required field function in the extension options.'
  },

  EXTENSION_REQUIRED_DIY_OR_CONNECTOR_ID_FIELD: {
    code: 'missing_required_field',
    message: 'Need to set either the diy or _connectorId field in extension options.'
  },

  EXTENSION_DIY_DOESNT_EXIST: {
    code: 'missing_required_field',
    message: 'DIY is not configured in the extension configuration.'
  },

  EXTENSION_CONNECTOR_ID_DOESNT_EXIST: {
    code: 'invalid_field',
    message: 'The _connectorId set in the extension options does\'t match any of the _connectorId\'s present in extension configuration.'
  },

  EXTENSION_FUNCTION_TYPE_STRING: {
    code: 'invalid_field',
    message: 'The function field in the extension options must be of type string.'
  },

  EXTENSION_INCORRECT_FUNCTION: {
    message: 'The function passed in the extension options doesn\'t map to a function.',
    code: 'invalid_function'
  },

  EXTENSION_RESPONSE_IS_NOT_SERIALIZABLE: {
    message: 'Extension response is not serializable.',
    code: 'invalid_extension_response'
  },

  EXTENSION_MISSING_FUNCTION_OPTIONS: {
    code: 'missing_required_field',
    message: 'Function options haven\'t been provided.'
  },

  CONFIG_OPTIONS_NOT_PROVIDED: {
    message: 'Options parameter is not provided.',
    code: 'missing_parameter'
  },

  CONFIG_SET_DIY_OR_CONNECTORS: {
    message: 'Either DIY or connectors field needs to be set.',
    code: 'missing_required_field'
  },

  CONFIG_NO_CONNECTORS_PROVIDED: {
    message: 'No connector modules provided in the connectors field.',
    code: 'invalid_field'
  },

  CONFIG_DIY_AND_CONNECTORS_EXIST: {
    message: 'The configuration object should only have one of the diy or connectors field.',
    code: 'invalid_configuration'
  }
}

var getError = function (key, message) {
  var error = new Error(message || errors[key].message)
  var errorValue = errors[key]
  for (var prop in errorValue) {
    if (errorValue.hasOwnProperty(prop)) {
      error[prop] = errorValue[prop]
    }
  }
  return error
}

var get = function (key) {
  return errors[key]
}

exports.getError = getError
exports.get = get
