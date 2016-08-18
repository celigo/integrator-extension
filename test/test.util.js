'use strict'

var util = require('../lib/util')
var should = require('should')

describe('Util functions', function () {
  it('should check object serialization', function (done) {
    util.isSerializable(null).should.equal(true)
    util.isSerializable(undefined).should.equal(true)
    util.isSerializable(true).should.equal(true)
    util.isSerializable(23).should.equal(true)
    util.isSerializable('dd').should.equal(true)

    util.isSerializable({a: undefined}).should.equal(true)
    util.isSerializable({a: 2, b: null}).should.equal(true)
    util.isSerializable({a: 2, b: ['a', undefined, null, 2, ['ab', undefined]]}).should.equal(true)

    util.isSerializable({a: new Date()}).should.equal(false)
    util.isSerializable({a: new Error('errors are not serializable!')}).should.equal(false)
    done()
  })
})

describe('sizeof tests', function () {
  it('should handle null in object keys', function (done) {
    var badData = {'1': {'depot_id': null, 'hierarchy_node_id': null}}
    console.log('size', util.sizeof(badData))
    util.sizeof(badData)
    done()
  })

  it('null is 0', function (done) {
    util.sizeof(null).should.be.equal(0)
    done()
  })

  it('number size shall be 8', function (done) {
    util.sizeof(5).should.be.equal(8)
    done()
  })

  it('undefined is 0', function (done) {
    util.sizeof().should.be.equal(0)
    done()
  })

  it('of 3 chars string is 2*3=6', function (done) {
    util.sizeof('abc').should.be.equal(6)
    done()
  })

  it('simple object of 3 chars for key and value', function (done) {
    util.sizeof({abc: 'def'}).should.be.equal(2 * 3 * 2)
    done()
  })

  it('boolean size shall be 4', function (done) {
    util.sizeof(true).should.be.equal(4)
    done()
  })

  it('nested objects shall be counted in full', function (done) {
    // 4 one two-bytes char strings and 3 eighth-bytes numbers
    var param = {a: 1, b: 2, c: {d: 4}}
    util.sizeof(param).should.be.equal(4 * 2 + 3 * 8)
    done()
  })

  it('object with 100 three-chars keys and values as numbers => 100 * 2 * 3 + 100 * 8', function (done) {
    var obj = {}
    var ELEMENTS = 100
    // start from 1M to have the same keys length
    for (var i = 100; i < 100 + ELEMENTS; i++) {
      obj[i] = i
    }

    util.sizeof(obj).should.be.equal(ELEMENTS * 2 * (('' + ELEMENTS).length) + ELEMENTS * 8)
    done()
  })

  it('report an error for circular dependency objects', function (done) {
    var firstLevel = {a: 1}
    var secondLevel = {b: 2, c: firstLevel}
    firstLevel.second = secondLevel
    should.exist(util.sizeof(firstLevel))
    done()
  })
})
