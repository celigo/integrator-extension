'use strict'

var testUtil = require('./util')
var should = require('should')

var _importId = '_importId'
var bearerToken = 'bearerToken'

var genTests = function (flat) {
  describe('hook tests', function () {
    before(function (done) {
      testUtil.createMockExtension(true, false, flat, done)
    })

    it('should pass after successfully calling hook function.', function (done) {
      var options = {
        key1: [{ a: 1 }, { b: 2 }],
        key2: { k: 'v' },
        bearerToken: bearerToken,
        _importId: _importId
      }

      var extensionProperties = {
        diy: true,
        type: flat ? undefined : 'hook',
        function: 'doSomething',
        maxResponseSize: 2000
      }

      testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
        should.not.exist(four0xErrors)
        var expected = [{
          key1: [{ a: 1 }, { b: 2 }],
          key2: { k: 'v' },
          bearerToken: 'bearerToken',
          _importId: _importId,
          function: 'doSomething'
        }]
        data.should.eql(expected)
        done()
      })
    })

    it('should fail with 422 for error', function (done) {
      var extensionProperties = {
        diy: true,
        type: flat ? undefined : 'hook',
        function: 'doSomethingError',
        maxResponseSize: 2000
      }

      var options = {
        key1: ['abc'],
        bearerToken: bearerToken,
        _importId: _importId
      }

      testUtil.callFunction(options, extensionProperties, function (four0xErrors, data) {
        var expected = [{ code: 'my_error', message: 'doSomethingError' }]
        testUtil.validateErrorsRetured(four0xErrors, expected)
        done()
      })
    })
  })
}
genTests(false)
genTests(true)
