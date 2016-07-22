'use strict'

var _ = require('lodash')
var sizeof = require('object-sizeof')
var errors = require('./errors')

var util = {}

util.isSerializable = function (obj) {
  if (_.isUndefined(obj) ||
    _.isNull(obj) ||
    _.isBoolean(obj) ||
    _.isNumber(obj) ||
    _.isString(obj)) {
    return true
  }

  if (!_.isPlainObject(obj) &&
    !_.isArray(obj)) {
    return false
  }

  for (var key in obj) {
    if (!util.isSerializable(obj[key])) {
      return false
    }
  }

  return true
}

util.validateAndReturnResponse = function (maxResponseSize, result) {
  maxResponseSize = maxResponseSize || (5 * 1024 * 1024)

  if (sizeof(result) > maxResponseSize) {
    var error = {
      message: 'response stream exceeded limit of ' + maxResponseSize + ' bytes.',
      code: 'response_size_exceeded'
    }
    return error
  }

  if (!util.isSerializable(result)) {
    return errors.get('EXTENSION_RESPONSE_IS_NOT_SERIALIZABLE')
  }
}

util.getObjectName = function (type) {
  switch (type) {
    case 'hook':
      return 'hooks'
    case 'wrapper':
      return 'wrappers'
    case 'setting':
      return 'settings'
    default:
      return type
  }
}

util.findToken = function (req) {
  var token
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ')
    if (parts.length === 2) {
      var scheme = parts[0]
      var credentials = parts[1]
      if (/^Bearer$/i.test(scheme)) {
        token = credentials
      }
    }
  } else if (req.body && req.body.access_token) {
    token = req.body.access_token
  } else if (req.query && req.query.access_token) {
    token = req.query.access_token
  }

  return token
}

module.exports = util
