'use strict'

var abstractExtension = require('../abstractExtension')
var util = require('util')

function LambdaExtension () {}

util.inherits(LambdaExtension, abstractExtension)

module.exports = new LambdaExtension()
