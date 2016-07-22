'use strict'

var testUtil = require('./util')

var _importId = '_importId'
var bearerToken = 'bearerToken'

describe('Lambda hook tests', function () {
  it('should pass after successfully calling hook function.', function (done) {
    var options = {
      key1: [{a: 1}, {b: 2}],
      key2: {k: 'v'},
      bearerToken: bearerToken,
      _importId: _importId
    }

    var extensionProperties = {
      diy: true,
      type: 'hook',
      function: 'doSomething',
      maxResponseSize: 2000
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (err, data) {
      if (err) return done(err)
      data.StatusCode.should.equal(200)
      var body = JSON.parse(data.Payload)
      var expected = [{
        key1: [{a: 1}, {b: 2}],
        key2: {k: 'v'},
        bearerToken: 'bearerToken',
        _importId: _importId,
        function: 'doSomething'
      }]
      body.should.eql(expected)
      done()
    })
  })

  it('should fail with 422 for error', function (done) {
    var extensionProperties = {
      diy: true,
      type: 'hook',
      function: 'doSomethingError',
      maxResponseSize: 2000
    }

    var options = {
      key1: ['abc'],
      bearerToken: bearerToken,
      _importId: _importId
    }

    testUtil.invokeFunction(options, extensionProperties, 'hooksWrappersTest', function (err, data) {
      if (err) return done(err)

      var expected = [{ code: 'my_error', message: 'doSomethingError' }]
      testUtil.validateErrorRetured(data, expected, done)
    })
  })
})
