# integrator-extension
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

integrator-extension is a module which provides support for integrator.io [extensions](extension.md) through multiple services.

## Installation

Using npm:
```
$ npm i --save integrator-extension
```
## Services
Currently integrator-extension supports execution of extensions through [express](#express) and [lambda](#lambda). Each of the services provide
a function to configure the extension to which a configuration object has to be passed. Following are the common configuration
fields in express and lambda.

**diy**

> What is diy?
> diy stands for Do it yourself, wherein you create an integration from
> scratch in integrator.io.

> For the field diy in configuration you need to set the value to the node
> module which contains all the hooks and wrapper functions which will
> be part of your integration.

**connectors**

> What is a connector?
> Connector represent fully functional pre-built integration that any
> user can install into their Integrator account, directly from the
> Integrator Marketplace.

> For the field connectors in configuration you need to set the value to
> an object containing a list of key value pairs where each key is a
> \_connectorId of a particular connector and the value is the node
> module containing the hooks, wrappers, installer, uninstaller and
> settings functions which will be utilized by connector.

**Note**: The configuration object needs to contain one of the diy or connectors field set.

### Express

Using express extension service an express app is created which exposes an api which will be used by
integrator.io to invoke the extensions and get back the results. This service is based on the stack
which you have created in integrator.io. The baseURI for the api will be same as the hostURI of the stack
and stack's systemToken is used to authenticate the requests made to the api.

#### Usage

```js
var expressExtension = require('integrator-extension').express

expressExtension.createServer(config, function (err) {

})

expressExtension.stopServer(function (err) {

})
```

#### createServer(config, callback)

createServer is the function provided by express service to set the configurations. Below are the configuration fields
that need to be set along with the common fields mentioned previously.

**port**

> This field is to specify on which port should the
> express-integrator-extension be deployed on. Default port no. is 80.

**systemToken**

> This is a required field. This needs to be set to the stack's systemToken
> which you have created in integrator.io.

**maxSockets**

> This field is to customize the value for https.globalAgent.maxSockets.
> Default value is set to Infinity.

**winstonInstance**

> This field is used to pass the winston instance which will be used to log information.


#### stopServer(callback)

stopServer function stops the express app from listening to the designated port.


### Lambda

Lambda extension service can be used when extensions need to be executed on [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html). The service is based on the stack of type lambda which is created in integrator.io. integrator.io uses the aws information
provided in the stack to invoke the extensions and get the results.

#### Usage

```js
var lambdaExtension = require('integrator-extension').lambda

exports.handler = lambdaExtension.createHandler(config)
```

#### createHandler(callback)

createHandler is the function provided by lambda service to set the configurations. The result of execution of createHandler function needs
to be assigned to exports.handler which in turn will be executed whenever integrator.io sends a request to execute any of the extensions defined.
