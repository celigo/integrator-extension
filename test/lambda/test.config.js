'use strict'

var testUtil = require('./util')
var createHandlerTestFunction = require('./lambda-test-functions').createHandlerTest

describe('Lambda tests', function () {
  it('should return error if configuration is not passed to the createHandler function.', function (done) {
    testUtil.invokeFunction({}, {}, 'createHandlerTest', function (err, data) {
      if (err) return done(err)

      var expected = [{
        message: 'Options parameter is not provided.',
        code: 'missing_parameter'
      }]

      testUtil.validateErrorRetured(data, expected, done)
    })
  })

  it('should return error if neither of the diy or connectors fields are set.', function (done) {
    createHandlerTestFunction.options.setOptions = 1
    testUtil.invokeFunction({}, {}, 'createHandlerTest', function (err, data) {
      if (err) return done(err)

      var expected = [{
        message: 'Either DIY or connectors field needs to be set.',
        code: 'missing_required_field'
      }]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })

  it('should return error if connectors field is an empty object.', function (done) {
    createHandlerTestFunction.options.connectors = {}
    testUtil.invokeFunction({}, {}, 'createHandlerTest', function (err, data) {
      if (err) return done(err)

      var expected = [{
        message: 'No connector modules provided in the connectors field.',
        code: 'invalid_field'
      }]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })
})
