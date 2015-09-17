'use strict'

var _ = require('lodash')

var util = {}

util.isSerializable = function(obj) {
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

module.exports = util
