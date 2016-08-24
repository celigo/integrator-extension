'use strict'

var AbstractExtension = require('../lib/abstractExtension')
var extension = new AbstractExtension()

describe('Extension loadConfiguration tests', function () {
  it('should return error if options parameter is not passed to the loadConfiguration function.', function (done) {
    extension.loadConfiguration(undefined, function (e) {
      e.message.should.equal('Options parameter is not provided.')
      e.code.should.equal('missing_parameter')
      done()
    })
  })

  it('should return error if neither of the diy or connectors fields are set.', function (done) {
    var options = {a: 1}

    extension.loadConfiguration(options, function (e) {
      e.message.should.equal('Either DIY or connectors field needs to be set.')
      e.code.should.equal('missing_required_field')
      done()
    })
  })

  it('should return error if connectors field is an empty object.', function (done) {
    var options = {
      connectors: {}
    }

    extension.loadConfiguration(options, function (e) {
      e.message.should.equal('No connector modules provided in the connectors field.')
      e.code.should.equal('invalid_field')
      done()
    })
  })
})
