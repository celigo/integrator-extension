'use strict'

var should = require('should')
var assert = require('assert')
var logger = require('winston')
var util = require('../util')

describe('Util functions', function() {

  it('should check object serialization', function(done) {
    assert.equal(util.isSerializable(null), true)
    assert.equal(util.isSerializable(undefined), true)
    assert.equal(util.isSerializable(true), true)
    assert.equal(util.isSerializable(23), true)
    assert.equal(util.isSerializable('dd'), true)

    assert.equal(util.isSerializable({a: undefined}), true)
    assert.equal(util.isSerializable({a: 2, b: null}), true)
    assert.equal(util.isSerializable({a: 2, b: ['a', undefined, null, 2, ['ab', undefined]]}), true)

    assert.equal(util.isSerializable({a: new Date()}), false)
    assert.equal(util.isSerializable({a: new Error('errors are not serializable!')}), false)
    done()
  })
})
