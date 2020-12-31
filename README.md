# integrator-extension
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

integrator-extension provides an easy to use framework for extending [integrator.io](http://www.celigo.com/ipaas-integration-platform/) through various [extension functions](#extension-functions) that can be hosted on multiple environments (both server based or server-less). Currently, integrator-extension supports execution of extension functions through two extension types:

1. [Express](https://github.com/celigo/express-integrator-extension) based app running on a server
2. [AWS Lambda](https://github.com/celigo/lambda-integrator-extension).

## Installation

Using npm:
```
$ npm i --save integrator-extension
```

## Configuration

 A function loadConfiguration to configure the extension is provided to which a configuration object has to be passed. The configuration object can be used to setup extension functions for both Do it yourself (DIY) integrations and Connectors. Given below are the details of common configuration properties.

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

Different extension types may further provide additional configuration properties. Please refer to the respective repositories for more details.

---

## Extension Functions

Extension Functions allow a user to write custom code to further customize and enhance integrator.io. Currently
integrator.io supports the following functions.

**Note**: In the documentation that follows, the word value should be interpreted as defined at http://www.json.org/ unless mentioned otherwise.

#### preSavePage

This function gets invoked before saving a page of data that's fetched by the export for further processing. This
function can be used to add or delete records or modify the existing records present in the data that is passed to
the hook preSavePage function.

```js
/*
* preSavePageFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one 'options' argument that has the following fields:
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   'data' - an array of records representing one page of data. A record can be an object {} or array [] depending on the data source.
*   'errors' - an array of errors where each error has the structure {code: '', message: '', source: '', retryDataKey: ''}.
*   'retryData' - an object with structure {<retryDataKey>: { data: <record>, stage: <stage where error occured>, traceKey: <traceKey of record>}, ...} containing errored out records, stage info and their traceKeys.
*   '_exportId' - the _exportId currently running.
*   '_connectionId' - the _connectionId currently running.
*   '_flowId' - the _flowId currently running.
*   '_integrationId' - the _integrationId currently running.
*   '_parentIntegrationId' - the parent of the _integrationId currently running.
*   'pageIndex' - 0 based. context is the batch export currently running.
*   'lastExportDateTime' - delta exports only.
*   'currentExportDateTime' - delta exports only.
*   'settings' - all custom settings in scope for the export currently running.
*
* The function needs to return an object that has the following fields:
*   'data' - your modified data.
*   'errors' - your modified errors.
*   'abort' - instruct the batch export currently running to stop generating new pages of data.
*   'newErrorsAndRetryData' - can send new errors and corresponding data in the following format - [{retryData: <>, errors: []}].
*
* Throwing an exception will signal a fatal error and stop the flow.
*/
exports.preSavePageFunction = function (options, callback) {
  // sample code that simply passes on what has been exported
  return callback(error, {
    data: options.data,
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  })
} 
```

#### preMap

This function gets invoked before the fields are mapped to their respective fields in the objects to be imported. This function can be used to reformat the record's fields before they get mapped.

```js
/*
* preMapFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one ‘options’ argument that has the following fields:
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   ‘data’ - an array of records representing the page of data before it has been mapped.  A record can be an object {} or array [] depending on the data source.
*   '_importId' - the _importId currently running.
*   '_connectionId' - the _connectionId currently running.
*   '_flowId' - the _flowId currently running.
*   '_integrationId' - the _integrationId currently running.
*   '_parentIntegrationId' - the parent of the _integrationId currently running.
*   'settings' - all custom settings in scope for the import currently running.
*
* The function needs to return an array, and the length MUST match the options.data array length.
* Each element in the array represents the actions that should be taken on the record at that index.
* Each element in the array should have the following fields:
*   'data' - the modified/unmodified record that should be passed along for processing.
*   'errors' -  used to report one or more errors for the specific record.  Each error must have the following fields: {code: '', message: '', source: ‘’ }
* Returning an empty object {} for a specific record will indicate that the record should be ignored.
* Returning both 'data' and 'errors' for a specific record will indicate that the record should be processed but errors should also be logged.
* Throwing an exception will fail the entire page of records.
*/
exports.preMapFunction = function (options, callback) {
  return callback(error, options.data.map((d) => { return { data: d }})
}
```

#### postMap

This function gets invoked after the fields in the source objects have been mapped to their respective fields in object to be imported. This function can be used to further
modify the mapped data.

```js
/*
* postMapFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one argument ‘options’ that has the following fields:
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   ‘preMapData’ - an array of records representing the page of data before it was mapped.  A record can be an object {} or array [] depending on the data source.
*   ‘postMapData’ - an array of records representing the page of data after it was mapped.  A record can be an object {} or array [] depending on the data source.
*   '_importId' - the _importId currently running.
*   '_connectionId' - the _connectionId currently running.
*   '_flowId' - the _flowId currently running.
*   '_integrationId' - the _integrationId currently running.
*   '_parentIntegrationId' - the parent of the _integrationId currently running.
*   'settings' - all custom settings in scope for the import currently running.
*
* The function needs to return an array, and the length MUST match the options.data array length.
* Each element in the array represents the actions that should be taken on the record at that index.
* Each element in the array should have the following fields:
*   'data' - the modified/unmodified record that should be passed along for processing.
*   'errors' - used to report one or more errors for the specific record.  Each error must have the following fields: {code: '', message: '', source: ‘’ }
* Returning an empty object {} for a specific record will indicate that the record should be ignored.
* Returning both 'data' and 'errors' for a specific record will indicate that the record should be processed but errors should also be logged.
* Throwing an exception will fail the entire page of records.
*/
exports.postMapFunction = function (options, callback) {
  return callback(error, options.postMapData.map((d) => { return { data: d }}))
}
```

#### postSubmit

This function gets invoked after the records are processed by the import. It can be used to further process imported objects and modify the response data received from import for success and error cases. This can also be used to invoke some other process which need to be done at the end of the import.

```js
/*
* postSubmitFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one ‘options’ argument that has the following fields:
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   ‘preMapData’ - an array of records representing the page of data before it was mapped.  A record can be an object {} or array [] depending on the data source.
*   ‘postMapData’ - an array of records representing the page of data after it was mapped.  A record can be an object {} or array [] depending on the data source.
*   ‘responseData’ - an array of responses for the page of data that was submitted to the import application.  An individual response will have the following fields:
*     ‘statusCode’ - 200 is a success.  422 is a data error.  403 means the connection went offline.
*     ‘errors’ - [{code: '', message: '', source: ‘’}]
*     ‘ignored’ - true if the record was filtered/skipped, false otherwise.
*     ‘id’ - the id from the import application response.
*     ‘_json’ - the complete response data from the import application.
*     ‘dataURI’ - if possible, a URI for the data in the import application (populated only for errored records).
*   '_importId' - the _importId currently running.
*   '_connectionId' - the _connectionId currently running.
*   '_flowId' - the _flowId currently running.
*   '_integrationId' - the _integrationId currently running.
*   '_parentIntegrationId' - the parent of the _integrationId currently running.
*   'settings' - all custom settings in scope for the import currently running.
*
* The function needs to return the responseData array provided by options.responseData. The length of the responseData array MUST remain unchanged.  Elements within the responseData array can be modified to enhance error messages, modify the complete _json response data, etc...
* Throwing an exception will fail the entire page of records.
*/
exports.postSubmitFunction = function (options, callback) {
  return callback(error, options.responseData)
}
```

#### postResponseMap

```js
/*
 * postResponseMapFunction stub:
 *
 * The name of the function can be changed to anything you like.
 *
 * The function will be passed one 'options' argument that has the following fields:
 *   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *   'postResponseMapData' - an array of records representing the page of data after response mapping is completed. A record can be an object {} or array [] depending on the data source.
 *   'responseData' - the array of responses for the page of data.  An individual response will have the following fields:
 *      'statusCode' - 200 is a success.  422 is a data error.  403 means the connection went offline.
 *      'errors' - [{code: '', message: '', source: ''}]
 *      'ignored' - true if the record was filtered/skipped, false otherwise.
 *      'data' - exports only.  the array of records returned by the export application.
 *      'id' - imports only.  the id from the import application response.
 *      '_json' - imports only.  the complete response data from the import application.
 *      'dataURI' - imports only.  a URI for the data in the import application (populated only for errored records).
 *   'oneToMany' - as configured on your export/import resource.
 *   'pathToMany' - as configured on your export/import resource.
 *   '_exportId' - the _exportId currently running.
 *   '_importId' - the _importId currently running.
 *   '_connectionId' - the _connectionId currently running.
 *   '_flowId' - the _flowId currently running.
 *   '_integrationId' - the _integrationId currently running.
 *   '_parentIntegrationId' - the parent of the _integrationId currently running.
 *   'settings' - all custom settings in scope for the export/import currently running.
 *
 * The function needs to return the postResponseMapData array provided by options.postResponseMapData.  The length of postResponseMapData MUST remain unchanged.  Elements within postResponseMapData can be changed however needed.
​
 * Throwing an exception will signal a fatal error and fail the entire page of records.
 */
exports.postResponseMapFunction = function (options, callback) {
  return callback(error, options.postResponseMapData)
}
```

#### postAggregate

```js
 /*
* postAggregateFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one ‘options’ argument that has the following fields:
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   ‘postAggregateData’ - a container object with the following fields:
*     ‘success’ - true if data aggregation was successful, false otherwise.
*     ‘_json’ - information about the aggregated data transfer.  For example, the name of the aggregated file on the FTP site.
*     ‘code’ - error code if data aggregation failed.
*     ‘message’ - error message if data aggregation failed.
*     ‘source’ - error source if data aggregation failed.
*   '_importId' - the _importId currently running.
*   '_connectionId' - the _connectionId currently running.
*   '_flowId' - the _flowId currently running.
*    '_integrationId' - the _integrationId currently running.
*   '_parentIntegrationId' - the parent of the _integrationId currently running.
*   'settings' - all custom settings in scope for the import currently running.
*
* The function doesn't need a return value.
* Throwing an exception will signal a fatal error.
*/
exports.postAggregateFunction = function (options, callback) {
  return callback(error)
}
```

#### formInit

```js
/*
* formInit function stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one 'options' argument that has the following fields:
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   'resource' - the resource being viewed in the UI.
*   'parentResource' - the parent of the resource being viewed in the UI.
*   'license' - integration apps only.  the license provisioned to the integration.
*   'parentLicense' - integration apps only. the parent of the license provisioned to the integration.
*
* The function needs to return a form object for the UI to render.
* Throwing an exception will signal an error.
*/
exports.formInitFunction = function (options, callback) {
  return callback(error, options.resource.settingsForm.form)
}
```

#### preSave

```js
/*
* preSave function stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one 'options' argument that has the following fields:
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   'newResource' - the resource being saved.
*   'oldResource' - the resource last saved.
*
* The function needs to return the newResource object to save.
* Throwing an exception will signal an error.
*/
exports.preSaveFunction = function (options, callback) {
  return callback(error, options.newResource)
}
```

#### step
This function represents one step in the installation or uninstallation process. The step functions can be used to create resources, validate bundles etc.

```js
/*
* step function stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one 'options' argument that has the following fields:
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   `formSubmission` - form steps only.
*   `_connectionId` - connection steps only.
*   'resource' - the resource being installed/uninstalled.
*   'parentResource' - the parent of the resource being installed/uninstalled.
*   'license' - integration apps only. the license provisioned to the integration.
*   'parentLicense' - integration apps only. the parent of the license provisioned to the integration.
*
* The function does not need to return anything.
* Throwing an exception will signal an error.
*/
exports.stepFunction = function (options, callback) {
  return callback(error)
}
```

#### initChild
This function can be used to create child integration.

```js
/*
* initChildIntegration stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one ‘options’ argument that has the following fields: { parentIntegration: {}, parentLicense: {} }
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   `parentIntegration` - the parent of the child integration being initialized.
*   'parentLicense' - integration apps only. the license provisioned to the parent integration.
*
* The function needs to return the child integration to be created.
* Throwing an exception will signal an error.
*/  
exports.initChild = function (options) {
  return { name: "child integration", installSteps: [...] }
}
```

#### update
Update function is used to do an update for the integrations belonging to a connector. Whenever, new versions of the connector need to be released or there are any new features in a connector, update function can be used to do required changes for integrations installed in user accounts.

```js
/*
* update function stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one 'options' argument that has the following fields:
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   'resource' - the resource being updated.
*   'license' - integration apps only. the license provisioned to the integration.
*
* The function does not need to return anything.
* Throwing an exception will signal an error.
*/
exports.updateFunction = function (options, callback) {
  return callback(error)
}
```

#### changeEdition
This function can be used to change license specific features and is invoked when there are changes to the user's connector license.

```js
/*
* changeEdition function stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one 'options' argument that has the following fields:
*   'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
*   `fromEdition` - the edition currently installed.
*   `toEdition` - the new edition.
*   `integration` - the integration being changed.
*   'license' - the license provisioned to the integration.
*
* The function does not need to return anything.
* Throwing an exception will signal an error.
*/
exports.changeEditionFunction = function (options, callback) {
  return callback(error)
}
```

#### ping

This function is called to verify whether the connection defined for the wrapper adaptor is valid.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     connection - the connection object containing the connection configuration {encrypted: {...}, unencrypted: {...}}. 'encrypted' and 'unencrypted' are JSON objects which were saved on the corresponding wrapper connection.
 *     _importId/_exportId - _id of the export or import associated with the connection.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred. This will fail the whole call.
 *     response - Response object provides information about whether the ping was successful or not. It contains two fields statusCode and errors. statusCode should be set to
 *         401 and errors should be populated if the connection fails. Else, statusCode should be set to 200. { statusCode: 200/401, errors: [{message: 'error message', code: 'error code'}]}
 */
exports.pingConnectionFunction = function (options, callback) {
  return callback(error, response)
}
```

#### export

A wrapper export allows to write a full export and substitute the actual
implementation of an integrator.io export. The wrapper export function returns back pages of data and is called by integrator.io again
and again until all the records have been returned to integrator.io.

```js
/*
 * options parameter in export functions contains the following fields:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     connection - the connection object containing the connection configuration {encrypted: {...}, unencrypted: {...}}. 'encrypted' and 'unencrypted' are JSON objects which were saved on the corresponding wrapper connection.
 *     type - the export type and can have the values 'delta', 'type' or 'once'. If its not set then it should be assumed that all records need to be exported.
 *     delta - this field is set only when export type is delta. It contains a JSON object having two properties {dateField: ..., lastExecutionTime: ...}. 'dateField' is the field to be used to query
 *         records that need to be exported. lastExecutionTime (in milliseconds) is the date on which the corresponding export job was last run.
 *     once - this field is set only when export type is once and contains a JSON object having one property {booleanField: ...}. 'booleanField' is the field to be used to query
 *         records that need to be exported.
 *     test - this field is set only when export type is test and contains a JSON object having one property {limit: ...}. 'limit' is the maximum number of records that should be fetched.
 *     state - the allows to pass information between successive export calls. The state returned as part of response for previous call will be passed as is.
 *     _exportId - _id of the wrapper export.
 *     settings - the container for all integrator.io settings data for an integration (applicable only to connectors).
 *     configuration - the configuration provided for the wrapper export. Can be used to further customize the wrapper.
 *     data - this field is set only when the export is used as a pageProcessor in an orchestrated flow and contains the data that is generated by the previous pageGenerator or pageProcessors before this export is invoked.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred. This will halt the export process.
 *     response - the response should contain a JSON object where following properties can be set. connectionOffline: A boolean value to specify if connection went offline during the course of the export. If set to true this will make the wrapper connection offline and stop the export process. data: An array of values where each value is a record that has been exported. errors: An array of JSON objects where each element represents error information in the format {message: 'error message', code: 'error code'} that occurred during the export. lastPage: A boolean to convey integrator.io that this is the last page of the export process. No more calls will be made once lastPage is set to true. state: An object which can be used to specify the current state of the export process that will be passed back in the next call to the wrapper function.
 */
exports.exportFunction = function (options, callback) {
  return callback(error, response)
}
```
**Note:** No further calls will be made to a wrapper function if same response is sent more than 5 times to integrator.io during an export process by the wrapper function. integrator.io will consider this as an infinite loop and stop the export process.

#### import
A wrapper import allows to write a full end to end import and substitute the actual
implementation of an integrator.io import.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     connection - the connection object containing the connection configuration {encrypted: {...}, unencrypted: {...}}. 'encrypted' and 'unencrypted' are JSON objects which were saved on the corresponding wrapper connection.
 *     preMapData - an array of values which was used for mapping by the import.
 *     postMapData - an array of values which was obtained after the mapping was done based on the mapping configuration set for the import.
 *     _importId - _id of the wrapper import.
 *     settings - the container for all integrator.io settings data for an integration (applicable only to connectors).
 *     configuration - the configuration provided for the wrapper import. Can be used to further customize the wrapper.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred. This will halt the import process.
 *     response - Response is an array of JSON objects where each object should follow the following structure: {statusCode: 200/401/422, id: string, ignored: boolean, errors: [{code, message}]}. statusCode should be set to 200 when the import was successful, 401 when the operation failed with an authorization or connection error and 422 when some other error occurred during the process. id is the identifier of the record in the target system. ignored should set to true if the record was ignored and not imported. errors is an array of JSON objects representing the list of the errors that occurred while importing the records [{message: 'error message', code: 'error code'}]. errors can be used with statusCode 200 as well to indicate partial success, e.g., import succeeded without a field.
 */
exports.importFunction = function (options, callback) {
  return callback(error, response)
}
```
