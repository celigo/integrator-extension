'use strict'

var util = require('../lib/util')
var should = require('should')

describe('Util functions', function () {
  describe('sizeOf tests', function () {
    it('should handle null in object keys', function (done) {
      var badData = {'1': {'depot_id': null, 'hierarchy_node_id': null}}
      util.sizeOf(badData).should.equal(48)
      done()
    })

    it('null is 0', function (done) {
      util.sizeOf(null).should.be.equal(4)
      done()
    })

    it('number size shall be 8', function (done) {
      util.sizeOf(5).should.be.equal(1)
      done()
    })

    it('undefined is 0', function (done) {
      util.sizeOf().should.be.equal(0)
      done()
    })

    it('simple object of 3 chars for key and value', function (done) {
      util.sizeOf({abc: 'def'}).should.be.equal(13)
      done()
    })

    it('boolean size shall be 4', function (done) {
      util.sizeOf(true).should.be.equal(4)
      done()
    })

    it('nested objects shall be counted in full', function (done) {
      var param = {a: 1, b: 2, c: {d: 4}}
      util.sizeOf(param).should.be.equal(25)
      done()
    })

    it('should return -1 when data is not serializable', function (done) {
      var errorMsg
      try {
        util.validateObject({a: new Date()})
      } catch (ex) {
        errorMsg = ex.message
      }

      errorMsg.should.equal('Extension response is not serializable.')

      try {
        util.validateObject({a: new Error('errors are not serializable!')})
      } catch (ex) {
        errorMsg = ex.message
      }

      errorMsg.should.equal('Extension response is not serializable.')

      try {
        var a = {}
        a.b = a
        util.sizeOf(a)
      } catch (ex) {
        errorMsg = ex.message
      }

      errorMsg.should.equal('Extension response is not serializable.')
      done()
    })
  })
})
