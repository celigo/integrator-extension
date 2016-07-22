var abstractExtension = require('../abstractExtension')
var util = require('util')
var errors = require('../errors')
var extensionUtil = require('../util')

function ExpressExtension () {}

util.inherits(ExpressExtension, abstractExtension)

ExpressExtension.prototype.validateConfigurationSpecifics = function (config, callback) {
  if (!config.systemToken) return callback(errors.getError('SERVER_SYSTEMTOKEN_NOT_PROVIDED'))
  return callback()
}

ExpressExtension.prototype.isAuthorized = function (req) {
  var systemToken = extensionUtil.findToken(req)

  if (!this.getConfiguration() || systemToken !== this.getConfiguration().systemToken) {
    return false
  }

  return true
}

module.exports = new ExpressExtension()
