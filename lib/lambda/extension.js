'use strict'

var AbstractExtension = require('../abstractExtension')
var util = require('util')

function LambdaExtension () {}

util.inherits(LambdaExtension, AbstractExtension)

module.exports = new LambdaExtension()
