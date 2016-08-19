'use strict'

var util = require('../lib/util')
var should = require('should')

describe('Util functions', function () {
  describe('sizeOf tests', function () {
    it('should handle null in object keys', function (done) {
      var badData = {'1': {'depot_id': null, 'hierarchy_node_id': null}}
      util.sizeOf(badData).should.equal(52)
      done()
    })

    it('null is 0', function (done) {
      util.sizeOf(null).should.be.equal(0)
      done()
    })

    it('number size shall be 8', function (done) {
      util.sizeOf(5).should.be.equal(8)
      done()
    })

    it('undefined is 0', function (done) {
      util.sizeOf().should.be.equal(0)
      done()
    })

    it('of 3 chars string is 2*3=6', function (done) {
      util.sizeOf('abc').should.be.equal(6)
      done()
    })

    it('simple object of 3 chars for key and value', function (done) {
      util.sizeOf({abc: 'def'}).should.be.equal(2 * 3 * 2)
      done()
    })

    it('boolean size shall be 4', function (done) {
      util.sizeOf(true).should.be.equal(4)
      done()
    })

    it('nested objects shall be counted in full', function (done) {
      // 4 one two-bytes char strings and 3 eighth-bytes numbers
      var param = {a: 1, b: 2, c: {d: 4}}
      util.sizeOf(param).should.be.equal(4 * 2 + 3 * 8)
      done()
    })

    it('object with 100 three-chars keys and values as numbers => 100 * 2 * 3 + 100 * 8', function (done) {
      var obj = {}
      var ELEMENTS = 100
      // start from 1M to have the same keys length
      for (var i = 100; i < 100 + ELEMENTS; i++) {
        obj[i] = i
      }

      util.sizeOf(obj).should.be.equal(ELEMENTS * 2 * (('' + ELEMENTS).length) + ELEMENTS * 8)
      done()
    })

    it('should return -1 when data is not serializable', function (done) {
      util.sizeOf({a: new Date()}).should.equal(-1)
      util.sizeOf({a: new Error('errors are not serializable!')}).should.equal(-1)
      done()
    })
  })
})
