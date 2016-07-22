'use strict'

var errors = require('../errors')
var extension = require('./extension')

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.json({ success: true })
  })

  app.get('/healthCheck', function (req, res) {
    res.json({ success: true })
  })

  app.post('/function',
    authenticate,
    callFunction
  )
}

function authenticate (req, res, next) {
  if (extension.isAuthorized(req)) return next()
  res.set('WWW-Authenticate', 'invalid system token')
  return res.status(401).json({ errors: [errors.get('ROUTES_INVALID_SYSTEM_TOKEN')] })
}

function callFunction (req, res, next) {
  extension.callFunction(req.body.options, req.body, function (err, result) {
    if (err) {
      return res.status(err.statusCode).json({errors: err.errors})
    }
    return res.json(result)
  })
}
