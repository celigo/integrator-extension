'use strict'

var request = require('request')
var extension = require('../../lib/main')
var expressExtension = extension.express
var testModule = require('./testModule')

exports.postRequest = function (uri, json, bearerToken, callback) {
  var requestOptions = {
    uri: uri,
    json: json,
    method: 'POST',
    auth: {
      bearer: bearerToken
    }
  }

  request(requestOptions, function (error, res, body) {
    return callback(error, res, body)
  })
}

exports.putRequest = function (uri, json, bearerToken, callback) {
  var requestOptions = {
    uri: uri,
    json: json,
    method: 'PUT',
    auth: {
      bearer: bearerToken
    }
  }

  request(requestOptions, function (error, res, body) {
    return callback(error, res, body)
  })
}

exports.getRequest = function (uri, bearerToken, callback) {
  var requestOptions = {
    uri: uri,
    method: 'GET',
    json: true,
    auth: {
      bearer: bearerToken
    }
  }

  request(requestOptions, function (error, res, body) {
    return callback(error, res, body)
  })
}

exports.deleteRequest = function (uri, bearerToken, callback) {
  var requestOptions = {
    uri: uri,
    method: 'DELETE',
    json: true,
    auth: {
      bearer: bearerToken
    }
  }

  request(requestOptions, function (error, res, body) {
    return callback(error, res, body)
  })
}

exports.createMockExpressServer = function (diy, connector, callback) {
  expressExtension.createServer({
    diy: diy ? testModule : undefined,
    connectors: {
      '9ce44f88a25272b6d9cbb430ebbcfcf1': connector ? testModule : undefined,
      '6a4b9e817fb9f522dbd012f642855a03': connector ? testModule : undefined
    },
    port: 7000,
    systemToken: 'INTEGRATOR_EXTENSION_SYSTEM_TOKEN'
  }, function (e) {
    return callback(e)
  })
}

exports.stopMockExpressServer = function (callback) {
  expressExtension.stopServer(function (err) {
    return callback(err)
  })
}
