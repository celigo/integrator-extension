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
---

## Extension Functions

Extension Functions allow a user to write custom code to further customize and enhance integrator.io. Currently
integrator.io supports the following type of extension functions:

  * [Hooks](#hooks)
  * [Wrappers](#wrappers)
  * [Installer](#installer) (applicable only to connectors)
  * [Uninstaller](#uninstaller) (applicable only to connectors)
  * [Settings](#settings) (applicable only to connectors)

**Note**: In the documentation that follows, the word value should be interpreted as defined at http://www.json.org/ unless mentioned otherwise.

### Hooks

A flow in integrator.io is mainly composed of an export and an import. The export is responsible for getting the data of the source system and breaking it
into smaller pages. The import processes those pages and stores the data in the target system. Hooks are custom code that can be executed at different stages during the execution of a flow and allow to modify the behavior of export and import processes.

#### Export hooks

Export hooks are executed during the export process of a flow. Currently integrator supports
only one type of hook - preSavePage.

**preSavePage**

This hook gets invoked before saving a page of data that's fetched by the export for further processing. This
hook can be used to add or delete records or modify the existing records present in the data that is passed to
the hook preSavePage function.

```js
/*
 * preSavePageFunction:
 *
 * The name of the function can be changed to anything you like.
 *
 * The function will be passed an 'options' argument and a callback argument.
 * The first argument 'options' has the following structure: { bearerToken: '', preview: true/false, _exportId: '', _connectionId: '', _integrationId: '', _flowId: '', data: [], errors: [], settings: {}, configuration: {} }
 *     'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     'preview' - a boolean flag used to indicate that this export is being used by the integrator.io UI to get a sample of the data being exported.
 *     '_exportId' - the _exportId of the export for which the hook is defined.
 *     '_connectionId' - the _id of the connection linked to the export for which the hook is defined.
 *     '_integrationId' - the _id of the integration linked to the export for which the hook is defined.
 *     '_flowId' - the _id of the flow linked to the export for which the hook is defined.
 *     'data' - an array of records representing one page of data.  An individual record can be an object {}, or an array [] depending on the data source.
 *     'errors' - an array of errors where each error has the structure {code: '', message: '', source: ''}.
 *     'settings' - a container object for all the SmartConnector settings associated with the integration (applicable to SmartConnectors only).
 *     'configuration' - an optional configuration object that can be set directly on the export resource (to further customize the hooks behavior).
 *
 * The function needs to call back with the following arguments:
 *     'err' - an error object to signal a fatal exception and will stop the flow.
 *     'responseData' - an object that has the following structure: { data: [], errors: [{code: '', message: '', source: ''}] }
 *         'data' -  your modified data.
 *         'errors' - your modified errors.
 */

module.hooks.preSavePageFunction = function (options, callback) {
  return callback(err, responseData)
}
```

#### Import hooks

Import hooks are the hooks that are executed during the import process of a flow run. Currently integrator supports three types
of import hooks - preMap, postMap and postSubmit.

**preMap**

This hook gets invoked before the fields are mapped to their respective fields in the objects to be imported. This hook can be used to reformat the record's fields before they get mapped.


```js
/*
 * preMapFunction:
 *
 * The name of the function can be changed to anything you like.
 *
 * The function will be passed an 'options' argument and a callback argument.
 * The first argument 'options' has the following structure: { bearerToken: '', _importId: '', _connectionId: '', _integrationId: '', _flowId: '', data: [], settings: {}, configuration: {} }
 *     'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     '_importId' - the _importId of the import for which the hook is defined.
 *     '_connectionId' - the _id of the connection linked to the import for which the hook is defined.
 *     '_integrationId' - the _id of the integration linked to the import for which the hook is defined.
 *     '_flowId' - the _id of the flow linked to the import for which the hook is defined.
 *     'data' - an array of records representing the page of data before it has been mapped.  An individual record can be an object {}, or an array [] depending on the data source.
 *     'settings' - a container object for all the SmartConnector settings associated with the integration (applicable to SmartConnectors only).
 *     'configuration' - an optional configuration object that can be set directly on the import resource (to further customize the hooks behavior).
 *
 * The function needs to call back with the following arguments:
 *     'err' - an error object to signal a fatal exception and will fail the entire page of records.
 *     'responseData' -  an array that has the following structure: [ { }, { }, ... ]
 *          The array length MUST match the options.data array length.
 *          Each element in the array represents the actions that should be taken on the record at that index.
 *          Each element in the array should have the following structure: { data: {}/[], errors: [{code: '', message: '', source: ''}] }
 *              'data' - The modified (or unmodified) record that should be passed along for processing.  An individual record can be an object {} or an array [] depending on the data source.
 *              'errors' - Used to report one or more errors for the specific record.  Each error must have the following structure: {code: '', message: '', source: '' }
 *          Returning an empty object {} for a specific record will indicate to integrator.io that the record should be ignored.
 *          Returning both 'data' and 'errors' for a specific record will indicate to integrator.io that the record should be processed but errors should also be logged on the job.
 *          Examples: {}, {data: {}}, {data: []}, {errors: [{code: '', message: '', source: ''}]}, {data: {}, errors: [{code: '', message: '', source: ''}]}
 */

module.hooks.preMapFunction = function (options, callback) {
  return callback(err, responseData)
}
```

**postMap**

This hook gets invoked after the fields in the source objects have been mapped to their respective fields in object to be imported. This hook can be used to further
modify the mapped data.

```js
/*
 * postMapFunction:
 *
 * The name of the function can be changed to anything you like.
 *
 * The function will be passed an 'options' argument and a callback argument.
 * The first argument 'options' has the following structure: { bearerToken: '', _importId: '', _connectionId: '', _integrationId: '', _flowId: '', preMapData: [], postMapData: [], settings: {}, configuration: {} }
 *     'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     '_importId' - the _importId of the import for which the hook is defined.
 *     '_connectionId' - the _id of the connection linked to the import for which the hook is defined.
 *     '_integrationId' - the _id of the integration linked to the import for which the hook is defined.
 *     '_flowId' - the _id of the flow linked to the import for which the hook is defined.
 *     'preMapData' - an array of records representing the page of data before it was mapped.  An individual record can be an object {}, or an array [] depending on the data source.
 *     'postMapData' - an array of records representing the page of data after it was mapped.  An individual record can be an object {}, or an array [] depending on the data source.
 *     'settings' - a container object for all the SmartConnector settings associated with the integration (applicable to SmartConnectors only).
 *     'configuration' - an optional configuration object that can be set directly on the import resource (to further customize the hooks behavior).
 *
 * The function needs to call back with the following arguments:
 *     'err' - an error object to signal a fatal exception and will fail the entire page of records.
 *     'responseData' - an array that has the following structure: [ { }, { }, ... ]
 *         The returned array length MUST match the options.data array length.
 *         Each element in the array represents the actions that should be taken on the record at that index.
 *         Each element in the array should have the following structure: { data: {}/[], errors: [{code: '', message: '', source: ''}] }
 *             'data' - The modified (or unmodified) record that should be passed along for processing.  An individual record can be an object {} or an array [] depending on the data source.
 *             'errors' - Used to report one or more errors for the specific record.  Each error must have the following structure: {code: '', message: '', source: '' }
 *         Returning an empty object {} for a specific record will indicate to integrator.io that the record should be ignored.
 *         Returning both 'data' and 'errors' for a specific record will indicate to integrator.io that the record should be processed but errors should also be logged on the job.
 *         Examples: {}, {data: {}}, {data: []}, {errors: [{code: '', message: '', source: ''}]}, {data: {}, errors: [{code: '', message: '', source: ''}]}
 */

module.hooks.postMapFunction = function (options, callback) {
  return callback(err, responseData)
}
```

**postSubmit**

This hook gets invoked after the records are processed by the import. It can be used to further process imported objects and modify the response data received from import for success and error cases. This can also be used to invoke some other process which need to be done at the end of the import.

```js
/*
 * postSubmitFunction:
 *
 * The name of the function can be changed to anything you like.
 *
 * The function will be passed an 'options' argument and a callback argument.
 * The first argument 'options' has the following structure: { bearerToken: '', _importId: '', _connectionId: '', _integrationId: '', _flowId: '', preMapData: [], postMapData: [], responseData: [], settings: {}, configuration: {} }
 *     'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     '_importId' - the _importId of the import for which the hook is defined.
 *     '_connectionId' - the _id of the connection linked to the import for which the hook is defined.
 *     '_integrationId' - the _id of the integration linked to the import for which the hook is defined.
 *     '_flowId' - the _id of the flow linked to the import for which the hook is defined.
 *     'preMapData' - an array of records representing the page of data before it was mapped.  An individual record can be an object {}, or an array [] depending on the data source.
 *     'postMapData' - an array of records representing the page of data after it was mapped.  An individual record can be an object {}, or an array [] depending on the data source.
 *     'responseData' - an array of responses for the page of data that was submitted to the import application.  An individual response will have the following structure: { statusCode: 200/422/403, errors: [], ignored: true/false, id: '', _json: {}, dataURI: '' }
 *         'statusCode' - 200 is a success.  422 is a data error.  403 means the connection went offline (typically due to an authentication or incorrect password issue).
 *         'errors' - [{code: '', message: '', source: ''}]
 *         'ignored' - true if the record was filtered/skipped, false otherwise.
 *         'id' - the id from the import application response.
 *         '_json' - the complete response data from the import application.
 *         'dataURI' - if possible, a URI for the data in the import application (populated only for errored records).
 *         'settings' - a container object for all the SmartConnector settings associated with the integration (applicable to SmartConnectors only).
 *         'configuration' - an optional configuration object that can be set directly on the import resource (to further customize the hooks behavior).
 *
 * The function needs to call back with the following arguments:
 *     'err' - an error object to signal a fatal exception and will fail the entire page of records.
 *     'responseData' - the responseData array provided by options.responseData. The length of the responseData array MUST remain unchanged. Elements within the responseData array can be modified to enhance error messages, modify the complete _json response data, etc...
 */

module.hooks.postSubmitFunction = function (options, callback) {
  return callback(err, returnResponseData)
}
```

**postAggregate**

This hook gets invoked after the final aggregated file is uploaded to the destination service. Note that this hook only works when the 'skipAggregation' property is 'false'. This hook is passed a read only object.

```js
 /*
 * postAggregrateFunction:
 *
 * The name of the function can be changed to anything you like.
 *
 * The function will be passed an 'options' argument and a callback argument.
 * The first argument 'options' has the following structure: { bearerToken: '', _importId: '', _connectionId: '', _integrationId: '', _flowId: '', postAggregateData: {}, settings: {},  configuration: {} }
 *     'bearerToken' - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     '_importId' - the _importId of the import for which the hook is defined.
 *     '_connectionId' - the _id of the connection linked to the import for which the hook is defined.
 *     '_integrationId' - the _id of the integration linked to the import for which the hook is defined.
 *     '_flowId' - the _id of the flow linked to the import for which the hook is defined.
 *     'postAggregateData' - a container object with the following structure: { success: true/false, _json: {} }
 *         'success' - true if data aggregation was successful, false otherwise.
 *         '_json' - information about the aggregated data transfer.  For example, the name of the aggregated file on the FTP site.
 *         'code' - error code if data aggregation failed.
 *         'message' - error message if data aggregation failed.
 *         'source' - error source if data aggregation failed.
 *     'settings' - a container object for all the SmartConnector settings associated with the integration (applicable to SmartConnectors only).
 *     'configuration' - an optional configuration object that can be set directly on the export resource (to further customize the hooks behavior).
 *
 * The function needs to call back with the following arguments:
 *     'err' - an error object to signal a fatal exception and will fail the entire page of records.
 */

module.hooks.postAggregateFunction = function (options, callback) {
  return callback(err)
}
```
---

### Wrappers

Wrappers allow you to write totally custom export and import adaptors. They provide an excellent way of connecting to applications that are not supported by integrator.io out of the box.

#### Ping

This wrapper function is called to verify whether the connection defined for the wrapper adaptor is valid.

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

module.wrappers.pingConnectionFunction = function (options, callback) {
  return callback(error, response)
}
```

#### Export

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

module.wrappers.exportFunction = function (options, callback) {
  return callback(error, response)
}
```
**Note:** No further calls will be made to a wrapper function if same response is sent more than 5 times to integrator.io during an export process by the wrapper function. integrator.io will consider this as an infinite loop and stop the export process.

#### Import
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

module.wrappers.importFunction = function (options, callback) {
  return callback(error, response)
}
```

---

### Installer
Installer functions are used to create or update different components of an integration based on features provided by a connector while installing a connector. Installer can be of three types - connector installer function, integration installer function and update function.

#### Connector installer function
Connector installer function is invoked when a user starts the connector install process. integrator.io creates an integration, associates the license to that integration and passes control to the
installer function with the required information so that relevant resources required by the integration can be created and install steps can be updated on the integration document. The function name has to be set on the installerFunction field on the connector.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     _integrationId - _id of the integration that is created.
 *     opts - this field contains the connector license related information.
 *     _connectorId - _id of the connector being installed.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred.
 *     response - No response is expected in this case.
 */

module.installer.connectorInstallerFunction = function (options, callback) {
  return callback(error, response)
}
```

#### Integration installer function
Integration installer function is invoked as the installation wizard proceeds through the install steps. These functions can be used to create required resources, validate bundles, etc. The function name has to be set on the installerFunction field of each install step on the integration.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     _integrationId - _id of the integration that is created.
 *     opts - this field contains the connector license related information.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred.
 *     response - an object in the below format:
 *         {success: boolean, stepsToUpdate: [<array of install steps present in integration document which need to be updated.>]}
 */

module.installer.integrationInstallerFunction = function (options, callback) {
  return callback(error, response)
}
```

#### Update function
Update function is used to do an update for the integrations belonging to a connector. Whenever, new versions of the connector need to be released or there are any new features in a connector, update function can be used to do required changes for integrations installed in user accounts. The function name has to be set on the updateFunction field on the connector. This function can be invoked only by the owner of the connector.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     _integrationId - _id of the integration.
 *     opts - this field contains the connector license related information.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred.
 *     response - no response is expected.
 */

module.installer.updateFunction = function (options, callback) {
  return callback(error, response)
}
```

---

### Uninstaller
Uninstaller functions are used to remove the components of an integration while uninstalling the connector. Uninstaller functions are of three
types - preUninstall function, integration uninstall function and connector uninstall function.

#### PreUninstall function
PreUninstall function is invoked before the uninstall process starts. This function can be used to any required tasks before the start of the uninstall process.
For instance, it can be used to modify the install steps to show them in different order to the end user. The function name has to be set on the preUninstallFunction field on the connector.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     _integrationId - _id of the integration that is created.
 *     opts - this field contains the connector license related information.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred.
 *     response - an object in the below format:
 *         {success: boolean, stepsToUpdate: [<array of install steps present in integration document which need to be updated.>]}
 */

module.uninstaller.preUninstallFunction = function (options, callback) {
  return callback(error, response)
}
```

#### Integration uninstall function
Integration uninstall function is similar to integration install function. This can be used to uninstall each component of integration in a procedural manner. The function name has to be set to the uninstallerFunction field of each install step on an integration.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     _integrationId - _id of the integration that is created.
 *     opts - this field contains the connector license related information.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred.
 *     response - an object in the below format:
 *         {success: boolean, stepsToUpdate: [<array of install steps present in integration document which need to be updated.>]}
 */

module.uninstaller.integrationUninstallerFunction = function (options, callback) {
  return callback(error, response)
}
```

#### Connector uninstall function
Connector uninstall function is used to remove all those documents which were not removed in the integration uninstall steps or complete any final uninstallation steps. Once this function completes the integration is deleted from integrator.io and the license is dissociated for future use. The function name has to be set to uninstallerFunction field on the connector.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     _integrationId - _id of the integration being installed.
 *     opts - this field contains the connector license related information.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred.
 *     response - No response expected.
 */

module.uninstaller.connectorUninstallerFunction = function (options, callback) {
  return callback(error, response)
}
```

---

### Settings
Settings functions are used to create and modify the settings of a connector based integration. Integration contains settings which stores user specific customizations or other information. integrator-extension supports following settings functions - persistSettings, refreshMetadata, changeEdition and getMappingMetadata.

#### persistSettings
persistSettings function is invoked whenever settings are updated in the UI and they need to be saved to integration document. The changed settings are passed to this function for updation, etc. as required.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     _integrationId - _id of the integration being installed.
 *     opts - this field contains the connector license related information.
 *     pending - a json object containing key value pairs of different fields involved in a setting that is being updated.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred.
 *     response - {success: boolean, pending: {<updated key value pairs of different fields involved in a setting>}}
 */

module.settings.persistSettings = function (options, callback) {
  return callback(error, response)
}
```

#### refreshMetadata
refreshMetadata function is invoked when a user tries to refresh the metadata used by the integration and the new metadata values needed to be updated in integration settings.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     _integrationId - _id of the integration being installed.
 *     opts - this field contains the connector license related information. It also contains all the information related to the field whose metadata is being refreshed and new metadata.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred.
 *     response - json object containing the information related to the field which also contains any changes done to new metadata.
 */

module.settings.refreshMetadata = function (options, callback) {
  return callback(error, response)
}
```

#### changeEdition
This function can be used to change license specific features and is invoked when there are changes to the user's connector license.

```js
/*
 * options object contains the following properties:
 *     bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     _integrationId - _id of the integration being installed.
 *     opts - this field contains the connector license related information.
 *
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred.
 *     response - no response expected.
 */

module.settings.changeEdition = function (options, callback) {
  return callback(error, response)
}
```

#### getMappingMetadata
getMappingMetadata function is used to add mapping validation for connectors to ensure certain business critical mappings are not removed/edited by a business user. This function is called on page refresh/load to get the mapping metadata for connector stack to make mappings non-editable or required (non-deletable) or both for a front end user.

```js
/*
 * options object contains the following properties:
 *
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *
 *  _integrationId - _id of the integration.
 *
 *  version - this field contains the version of the integration installed.
 *
 */

module.settings.getMappingMetadata = function (options, callback) {
  /*
   *  settings function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred. Currently, IO does not handle this.
   *
   *  response - Response data is an array of JSON objects where each object should follow following structure:
   *  {"import1-externalId":[{"requiredGenerateFields":["generateFieldId1", "generateFieldId2"...],"nonEditableGenerateFields":[""]},{"generateList":"generateListId1","requiredGenerateFields":[""],"nonEditableGenerateFields":[""]}], "import2-externalId" : [...]}
   *
   * externalId - Import adaptor external Id.
   *
   * requiredGenerateFields - A collection of generate field ids that should be marked as required on UI.
   *
   * nonEditableGenerateFields - A collection of generate field ids that should be marked as non-editable on UI.
   *
   * generateList - It contains generate list id of sublist and used to make the mapping mandatory of the sublist.
   *
   * To ensure an extract-generate mapping pair cannot be altered, add the generate field id to both requiredGenerateFields and nonEditableGenerateFields.
   *
   * To ensure that a generate mapping is always present and mapped with any extract/hardcoded value, add the generate field id to requiredGenerateFields.
   *
   */

  return callback(error, response)
}
```
