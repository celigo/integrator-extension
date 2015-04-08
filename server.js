var nconf = require('nconf').argv().env();
if (process.env.NODE_ENV !== 'production') {
  nconf.file('env/development.json');
  nconf.defaults({
    'NODE_ENV': 'development'
  });
}


var Hapi = require('hapi');
var server = new Hapi.Server();

var port = nconf.get('IC_PORT') || 80;
server.connection({ port: port });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.start(function () {
    console.log('Hapi Server listening on port:', port);
});
