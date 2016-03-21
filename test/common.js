var server = require('../server.js');
var nconf = require('nconf')
var logger = require('winston')

logger.info('Test node env - ' + nconf.get('NODE_ENV'));

if (nconf.get('NODE_ENV') !== 'unittest' && nconf.get('NODE_ENV') !== 'travis')
  throw new Error('nconf.get(\'NODE_ENV\')')
