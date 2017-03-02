'use strict'

var errors = require('./errors')
var isPlainObject = require('lodash.isplainobject')

var util = {}
var sizeChart = {
  STRING: 2,
  BOOLEAN: 4,
  NUMBER: 8
}

util.validateAndReturnResponse = function (maxResponseSize, result) {
  maxResponseSize = maxResponseSize || (5 * 1024 * 1024)

  var resultSize = sizeOf(result)
  if (resultSize > maxResponseSize) {
    var error = {
      message: 'response stream exceeded limit of ' + maxResponseSize + ' bytes.',
      code: 'response_size_exceeded'
    }
    return error
  }

  // sizeOf returns -1 if object is not serializable
  if (resultSize === -1) {
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
    case 'utility':
      return 'utilities'
    default:
      return type
  }
}

function sizeOf (obj) {
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
      size += sizeOf(key)

      var valueSize = sizeOf(obj[key])
      if (valueSize === -1) return -1
      size += valueSize
    }
  }
  return size
}

util.sizeOf = sizeOf

var objectProto = Object.prototype
var objectToString = objectProto.toString

// The below utility methods are extracted from lodash library

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
