'use strict'

var errors = require('./errors')
var isPlainObject = require('lodash.isplainobject')

var util = {}
var sizeChart = {
  STRING: 2,
  BOOLEAN: 4,
  NUMBER: 8
}

util.isSerializable = function (obj) {
  return sizeof(obj) >= 0
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

function sizeof (obj) {
  if (obj === undefined || obj === null) return 0
  if (isNumber(obj)) return sizeChart.NUMBER
  if (isBoolean(obj)) return sizeChart.BOOLEAN
  if (isString(obj)) return sizeChart.STRING * obj.length

  if (!isPlainObject(obj) &&
    !Array.isArray(obj)) {
    return -1
  }

  var size = 0
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      size += sizeof(key)
      try {
        var valueSize = sizeof(obj[key])
        if (valueSize === -1) return -1
        size += valueSize
      } catch (ex) {
        if (ex instanceof RangeError) {
          return -1
        }
      }
    }
  }
  return size
}

util.sizeof = sizeof

var objectProto = Object.prototype
var objectToString = objectProto.toString

function isNumber (value) {
  return typeof value === 'number' ||
    (!!value && typeof value === 'object' && objectToString.call(value) === '[object Number]')
}

function isBoolean (value) {
  return (value === true || value === false) ||
    (!!value && typeof value === 'object' && objectToString.call(value) === '[object Boolean]')
}

function isString (value) {
  return typeof value === 'string' ||
    (!!value && typeof value === 'object' && objectToString.call(value) === '[object String]')
}

util.isFunction = function (value) {
  var tag = isObject(value) ? objectToString.call(value) : ''
  return tag === '[object Function]' || tag === '[object GeneratorFunction]'
}

function isObject (value) {
  var type = typeof value
  return !!value && (type === 'object' || type === 'function')
}

module.exports = util
