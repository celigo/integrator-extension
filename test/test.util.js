'use strict'

var util = require('../lib/util')

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
