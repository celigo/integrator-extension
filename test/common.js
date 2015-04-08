require('longjohn');
require('nconf').argv().env();
require('../server.js');

console.log('process.env.NODE_ENV - ' + process.env.NODE_ENV);
