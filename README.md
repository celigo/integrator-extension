# integrator-extension
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

integrator-extension provides an easy to use framework for extending [integrator.io](http://www.celigo.com/ipaas-integration-platform/) through various [extension functions](extension.md) that can be hosted on multiple environments (both server based or server-less).

## Installation

Using npm:
```
$ npm i --save integrator-extension
```
## Extension Types
Currently, integrator-extension supports execution of extension functions through an [Express](#express) based app running on a server or AWS [Lambda](#lambda). Each of them provide a function to configure the extension to which a configuration object has to be passed. The configuration object can be used to setup extension functions for both Do it yourself (DIY) integrations and Connectors. Given below are the details for common configuration properties that apply to all extension types. They are followed by specific properties that are applicable to each type individually.

diy

> diy stands for Do it yourself, wherein you create an integration from
> scratch in integrator.io.

> For the field diy in configuration you need to set the value to the object which contains all the hooks and wrapper functions which will
> be part of your integration.

connectors

> A connector represents a fully functional pre-built integrator.io integration that any
> user can install into their Integrator account, directly from the
> [integrator.io Marketplace](http://www.celigo.com/integration-marketplace/).

> For the field connectors in configuration you need to set the value to
> an object containing a list of key value pairs where each key is a
> \_connectorId of a particular connector and the value is the node
> module/object containing the hooks, wrappers, installer, uninstaller and
> settings functions which will be utilized by the connector.

**Note**: The configuration object should only have one of the diy or connectors field.

### Express

Express can be used to create an express app which exposes an API that is used by
integrator.io to invoke the extension functions and get back the results. This extension type is based on the stack of type server in integrator.io. The baseURI for the API will be same as the hostURI of the stack
and stack's systemToken is used to authenticate the requests made to the API. You can host this express app on a single server or a set of servers behind a load balancer to scale as needed.

#### Usage

```js
var expressExtension = require('integrator-extension').express

expressExtension.createServer(config, function (err) {

})

expressExtension.stopServer(function (err) {

})
```

#### createServer(config, callback)

createServer function loads the configuration and starts an express app. Given below are the configuration fields that can be set along with the fields mentioned previously.

port

> Optional. This field specifies the port that should be used by the express server. Default port is 80.

systemToken

> Required. This needs to be set to the stack's systemToken
> that you created in integrator.io.

maxSockets

> Optional. This field is to customize the value for https.globalAgent.maxSockets.
> Default value is set to Infinity.

winstonInstance

> Optional. This field is used to pass the winston instance which will be used to log information. By default logs go only to the console output.


#### stopServer(callback)

stopServer function stops the express app from listening on the designated port.


### Lambda

Lambda can be used when extension functions are hosted on [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html). This allows to run the extension code in a server-less environment that helps in simplifying the deployment and maintenance process. To use this option your stack must be of type lambda in integrator.io. integrator.io uses the AWS [IAM User](http://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) Access Keys
provided on the stack to invoke the extension functions and get the results. The associated AWS IAM user must be assigned "lambda:InvokeFunction" permission for the AWS Lambda Function provided on the stack via an attached [IAM policy](http://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html?icmpid=docs_iam_console).

#### Usage

```js
var lambdaExtension = require('integrator-extension').lambda

exports.handler = lambdaExtension.createHandler(config)
```

#### createHandler(callback)

createHandler function loads the configuration and returns the handler that should be used when creating the AWS Lambda Function. The result of execution of createHandler function needs
to be assigned to exports.handler which in turn will be executed whenever integrator.io sends a request to execute any of the extension functions.
