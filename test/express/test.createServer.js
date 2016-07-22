'use strict'

var extensionServer = require('../../lib/express')

var port = 7000

describe('Server tests', function () {
  it('should return error if options parameter is not passed to the createServer function.', function (done) {
    extensionServer.createServer(undefined, function (e) {
      e.message.should.equal('Options parameter is not provided.')
      e.code.should.equal('missing_parameter')
      done()
    })
  })

  it('should return error if systemToken is not set', function (done) {
    var options = {
      diy: { x: function a () {} },
      port: port
    }

    extensionServer.createServer(options, function (e) {
      e.message.should.equal('systemToken not provided in options.')
      e.code.should.equal('missing_required_field')
      done()
    })
  })

  it('should return error if neither of the diy or connectors fields are set.', function (done) {
    var options = {
      port: port,
      systemToken: 'INTEGRATOR_EXTENSION_SYSTEM_TOKEN'
    }

    extensionServer.createServer(options, function (e) {
      e.message.should.equal('Either DIY or connectors field needs to be set.')
      e.code.should.equal('missing_required_field')
      done()
    })
  })

  it('should return error if connectors field is an empty object.', function (done) {
    var options = {
      port: port,
      systemToken: 'INTEGRATOR_EXTENSION_SYSTEM_TOKEN',
      connectors: {}
    }

    extensionServer.createServer(options, function (e) {
      e.message.should.equal('No connector modules provided in the connectors field.')
      e.code.should.equal('invalid_field')
      done()
    })
  })
})
