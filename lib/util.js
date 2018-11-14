'use strict'

var errors = require('./errors')
var isPlainObject = require('lodash.isplainobject')

var util = {}

util.validateAndReturnResponse = function (maxResponseSize, result) {
  maxResponseSize = maxResponseSize || (5 * 1024 * 1024)

  // doing JSON stringify is performed first to remove all cyclic issues.
  var resultSize = sizeOf(result)
  // sizeOf returns -1 if object is not serializable
  if (resultSize === -1) {
    return errors.get('EXTENSION_RESPONSE_IS_NOT_SERIALIZABLE')
  }

  // check for functions or dates or error instances etc.
  try {
    validateObject(result)
  } catch (ex) {
    return errors.get('EXTENSION_RESPONSE_IS_NOT_SERIALIZABLE')
  }

  if (resultSize > maxResponseSize) {
    var error = {
      message: 'response stream exceeded limit of ' + maxResponseSize + ' bytes.',
      code: 'response_size_exceeded'
    }
    return error
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
  try {
    var serializedForm = JSON.stringify(obj)
    return serializedForm ? serializedForm.length : 0
  } catch (ex) {
    return -1
  }
}

util.sizeOf = sizeOf

function validateObject (obj) {
  if (obj === undefined || obj === null || isNumber(obj) || isBoolean(obj) || isString(obj)) return
  if (!isPlainObject(obj) &&
    !Array.isArray(obj)) {
    throw errors.getError('EXTENSION_RESPONSE_IS_NOT_SERIALIZABLE')
  }

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      validateObject(key)

      validateObject(obj[key])
    }
  }
}

util.validateObject = validateObject

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
