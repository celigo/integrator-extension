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
 * options object in the preSavePageFunction contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *
 *  preview - a boolean flag used to indicate that this export is being used by the integrator.io UI to get a sample of
 * the data being exported. In some cases a developer may wish to branch their logic accordingly.
 *
 *  data - an array of values (a page) which has been exported by the export process.
 *     
 *  errors - an array of JSON objects where each JSON object contains the code and message of the error that occurred during the export process. Format of each JSON object will be {message: 'error message', code: 'error code'}
 *
 *  _exportId - the _exportId of the export for which the hook is defined.
 *
 *  settings - the container for all integrator.io settings data for an integration (applicable only to connectors).
 *
 *  configuration - the configuration provided for the preSavePage hook. Can be used to further customize the hook.
 */

module.hooks.preSavePageFunction = function (options, callback) {
  /*
   *  preSavePage function code
   */

  /*
   * The callback function expects two arguments.
   *	err - Error object to convey that a fatal error has occurred. This will stop the whole export process.
   *
   *	responseData - Response data is a JSON object which is of the following format: { data: value, errors: [{code: 'error code', message: 'error message'}] }. 'data' needs to be set to the modified data. Its structure is similar to the data parameter that is sent to the preSavePage function. 'errors' needs to be set to the modified errors. Its structure is similar to the errors parameter that is sent to the preSavePage function.
   *                 
   */

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
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     
 *  data - an array objects to be imported which will be used for mapping by integrator.io.                     
 *
 *  _importId - the _importId of the import for which the hook is defined.
 *
 *  settings - the container for all integrator.io settings data for an integration (applicable only to connectors).
 *
 *  configuration - the configuration provided for the preMap hook. Can be used to further customize the hook.
 */

module.hooks.preMapFunction = function (options, callback) {
  /*
   * preMap function code
   */

  /*
   * The callback function expects takes in two arguments.
   *	err - Error object to convey a fatal error has occurred. This will fail the whole page.
   *
   *	responseData - Response data is an array of JSON objects where each JSON object can be in the following four formats: {data: value}, {data: value, errors: [{code: 'error code', message: 'error message'}]}, {errors:[{code: 'error code', message: 'error message'}]} and {}. Here empty JSON will convey to integrator.io that the record should be ignored. If both data and errors are provided then the record will be processed and errors will also be logged on the job. The length of responseData must be same as data that was passed as part of options.
   *                    
   */

  return callback(err, responseData)		
}
```

**postMap**

This hook gets invoked after the fields in the source objects have been mapped to their respective fields in object to be imported. This hook can be used to further
modify the mapped data.

```js
/*
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     
 *  preMapData - an array of values which was used for mapping by the import.
 *
 *  postMapData - an array of values which was obtained after the mapping was done based on the mapping configuration set for the import.
 *     
 *  _importId - the _importId of the import for which the hook is defined.
 *
 *  settings - the container for all integrator.io settings data for an integration (applicable only to connectors).
 *
 *  configuration - the configuration provided for the postMap hook. Can be used to further customize the hook.
 */

module.hooks.postMapFunction = function (options, callback) {
  /*
   *  postMap function code
   */

  /*
   * The callback function takes in two arguments.
   *	err - Error object to convey a fatal error has occurred. This will fail the whole page.
   *
   *	responseData - Response data is an array where each element can be in the following four formats: {data: value}, {data: value, errors: [{code: 'error code', message: 'error message'}]}, {errors:[{code: 'error code', message: 'error message'}]} and {}. Here empty JSON will convey to integrator.io that the record should be ignored. If both data and errors are provided then the record will be processed and errors will also be logged on the job. The length of responseData must be same as data that was passed as part of options.
   *                    
   */

  return callback(err, responseData)		
}
```

**postSubmit**

This hook gets invoked after the records are processed by the import. It can be used to further process imported objects and modify the response data received from import for success and error cases. This can also be used to invoke some other process which need to be done at the end of the import.

```js
/*
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     
 *  preMapData - an array of values which was used for mapping by the import.
 *
 *  postMapData - an array of values which was obtained after the mapping was done based on the mapping configuration set for the import.
 *     
 *  responseData - an array of objects which corresponds to a canonical response produced to be import process. Each object in responseData has the following structure: {statusCode: 200/422, id: string, errors: [{code, message, source}], _json: obj}.  Note that the '_json' property contains the complete import response from the service this import integrated with.  For HTTP based services, this value will be the HTTP response body from the import operation.  This is a read/write property. Developers can modify this value if needed to support child import operations.
 *
 *  _importId - the _importId of the import for which the hook is defined.
 *
 *  settings - the container for all integrator.io settings data for an integration (applicable only to connectors).
 *
 *  configuration - the configuration provided for the postSubmit hook. Can be used to further customize the hook.
 */

module.hooks.postSubmitFunction = function (options, callback) {
  /*
   *  postSubmit function code
   */

  /*
   * The callback function takes in two arguments.
   *	err - Error object to convey a fatal error has occurred. This will fail the whole page.
   *
   *	responseData - returned responseData should have a similar structure and must have same length as the original responseData.
   *
   */

  return callback(err, returnResponseData)		
}
```

**postAggregate**

This hook gets invoked after the final aggregated file is uploaded to the destination service. Note that this hook only works when the 'skipAggregation' property is 'false'. This hook is passed a read only object.

```js
/*
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     
 *  postAggregateData - is read only json object.
 *    Sample Data:
 *    postAggregateData = {
 *      success: true, // status of import.
 *      _json: { name: 'inProgressFileName-2017-07-18T11-45-48.txt' } //Aggregated file name which is created by the file import.
 *    }
 *
 *  configuration - the configuration provided for the postAggregate hook. Can be used to further customize the hook.
 */

module.hooks.postAggregateFunction = function (options, callback) {
  /*
   *  postAggregation function code
   */

  /*
   * The callback function takes in one argument.
   *	err - Error object to convey that a fatal error has occurred. This will fail the whole page.
   *
   */

  return callback(err)		
}
```
---

### Wrappers

Wrappers allow you to write totally custom export and import adaptors. They provide an excellent way of connecting to applications that are not supported by integrator.io out of the box.

#### Ping

This wrapper function is called to verify whether the connection defined for the wrapper adaptor is valid.

```js
/* options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *     
 *  connection - the connection object containing the connection configuration {encrypted: {...}, unencrypted: {...}}. 'encrypted' and 'unencrypted' are JSON objects which were saved on the corresponding wrapper connection.
 *
 *  _importId/_exportId - _id of the export or import associated with the connection.
 *
 */

module.wrappers.pingConnectionFunction = function (options, callback) {
  /*
   *  ping function code
   */

  /*
   * The callback function takes in two arguments.
   *	err - Error object to convey a fatal error has occurred. This will fail the whole call.
   *
   *  response - Response object provides information about whether the ping was successful or not. It contains two fields statusCode and errors. statusCode should be set to
   401 and errors should be populated if the connection fails. Else, statusCode should be set to 200. { statusCode: 200/401, errors: [{message: 'error message', code: 'error code'}]}
   */

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
 *
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *
 *  connection - the connection object containing the connection configuration {encrypted: {...}, unencrypted: {...}}. 'encrypted' and 'unencrypted' are JSON objects which were saved on the corresponding wrapper connection.
 *
 *  type - the export type and can have the values 'delta', 'type' or 'once'. If its not set then it should be assumed that all records need to be exported.
 *  
 *  delta - this field is set only when export type is delta. It contains a JSON object having two properties {dateField: ..., lastExecutionTime: ...}. 'dateField' is the field to be used to query
 records that need to be exported. lastExecutionTime (in milliseconds) is the date on which the corresponding export job was last run.
 *
 *  once - this field is set only when export type is once and contains a JSON object having one property {booleanField: ...}. 'booleanField' is the field to be used to query
 records that need to be exported.
 *
 *  test - this field is set only when export type is test and contains a JSON object having one property {limit: ...}. 'limit' is the maximum number of records that should be fetched.
 *
 *  state - the allows to pass information between successive export calls. The state returned as part of response for previous call will be passed as is.
 *
 *  _exportId - _id of the wrapper export.
 *
 *  settings - the container for all integrator.io settings data for an integration (applicable only to connectors).
 *
 *  configuration - the configuration provided for the wrapper export. Can be used to further customize the wrapper.
 */

module.wrappers.exportFunction = function (options, callback) {
  /*
   *  export function code
   */

  /*
   *	err - Error object to convey a fatal error has occurred. This will halt the export process.
   *       
   *  response - the response should contain a JSON object where following properties can be set. connectionOffline: A boolean value to specify if connection went offline during the course of the export. If set to true this will make the wrapper connection offline and stop the export process. data: An array of values where each value is a record that has been exported. errors: An array of JSON objects where each element represents error information in the format {message: 'error message', code: 'error code'} that occurred during the export. lastPage: A boolean to convey integrator.io that this is the last page of the export process. No more calls will be made once lastPage is set to true. state: An object which can be used to specify the current state of the export process that will be passed back in the next call to the wrapper function.
   */

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
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *
 *  connection - the connection object containing the connection configuration {encrypted: {...}, unencrypted: {...}}. 'encrypted' and 'unencrypted' are JSON objects which were saved on the corresponding wrapper connection.
 *
 *  preMapData - an array of values which was used for mapping by the import.
 *
 *  postMapData - an array of values which was obtained after the mapping was done based on the mapping configuration set for the import.
 *
 *  _importId - _id of the wrapper import.
 *
 *  settings - the container for all integrator.io settings data for an integration (applicable only to connectors).
 *
 *  configuration - the configuration provided for the wrapper import. Can be used to further customize the wrapper.
 */

module.wrappers.importFunction = function (options, callback) {
  /*
   *  import function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred. This will halt the import process.
   *       
   *  response - Response is an array of JSON objects where each object should follow the following structure: {statusCode: 200/401/422, id: string, ignored: boolean, errors: [{code, message}]}. statusCode should be set to 200 when the import was successful, 401 when the operation failed with an authorization or connection error and 422 when some other error occurred during the process. id is the identifier of the record in the target system. ignored should set to true if the record was ignored and not imported. errors is an array of JSON objects representing the list of the errors that occurred while importing the records [{message: 'error message', code: 'error code'}]. errors can be used with statusCode 200 as well to indicate partial success, e.g., import succeeded without a field.
   */

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
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *  
 *  _integrationId - _id of the integration that is created.
 *
 *  opts - this field contains the connector license related information.
 *  
 *  _connectorId - _id of the connector being installed.
 *
 */

module.installer.connectorInstallerFunction = function (options, callback) {
  /*
   *  installer function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred.
   *       
   *  response - No response is expected in this case.
   *
   */

  return callback(error, response)
}
```

#### Integration installer function
Integration installer function is invoked as the installation wizard proceeds through the install steps. These functions can be used to create required resources, validate bundles, etc. The function name has to be set on the installerFunction field of each install step on the integration.

```js
/*
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *  
 *  _integrationId - _id of the integration that is created.
 *
 *  opts - this field contains the connector license related information.
 *  
 */

module.installer.integrationInstallerFunction = function (options, callback) {
  /*
   *  installer function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred.
   *       
   *  response - an object in the below format:
   *  {success: boolean, stepsToUpdate: [<array of install steps present in integration document which need to be updated.>]}
   *
   */

  return callback(error, response)
}
```

#### Update function
Update function is used to do an update for the integrations belonging to a connector. Whenever, new versions of the connector need to be released or there are any new features in a connector, update function can be used to do required changes for integrations installed in user accounts. The function name has to be set on the updateFunction field on the connector. This function can be invoked only by the owner of the connector.

```js
/*
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *  
 *  _integrationId - _id of the integration.
 *
 *  opts - this field contains the connector license related information.
 *
 */

module.installer.updateFunction = function (options, callback) {
  /*
   *  installer function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred.
   *       
   *  response - no response is expected.
   *
   */

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
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *  
 *  _integrationId - _id of the integration that is created.
 *
 *  opts - this field contains the connector license related information.
 *  
 */

module.uninstaller.preUninstallFunction = function (options, callback) {
  /*
   *  preUninstall function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred.
   *       
   *  response - an object in the below format:
   *  {success: boolean, stepsToUpdate: [<array of install steps present in integration document which need to be updated.>]}
   *
   */

  return callback(error, response)
}
```

#### Integration uninstall function
Integration uninstall function is similar to integration install function. This can be used to uninstall each component of integration in a procedural manner. The function name has to be set to the uninstallerFunction field of each install step on an integration.

```js
/*
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *  
 *  _integrationId - _id of the integration that is created.
 *
 *  opts - this field contains the connector license related information.
 *  
 */

module.uninstaller.integrationUninstallerFunction = function (options, callback) {
  /*
   *  uninstaller function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred.
   *       
   *  response - an object in the below format:
   *  {success: boolean, stepsToUpdate: [<array of install steps present in integration document which need to be updated.>]}
   *
   */

  return callback(error, response)
}
```

#### Connector uninstall function
Connector uninstall function is used to remove all those documents which were not removed in the integration uninstall steps or complete any final uninstallation steps. Once this function completes the integration is deleted from integrator.io and the license is dissociated for future use. The function name has to be set to uninstallerFunction field on the connector.

```js
/*
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *  
 *  _integrationId - _id of the integration being installed.
 *
 *  opts - this field contains the connector license related information.
 *
 */

module.uninstaller.connectorUninstallerFunction = function (options, callback) {
  /*
   *  uninstaller function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred.
   *       
   *  response - No response expected.
   */

  return callback(error, response)
}
```

---

### Settings
Settings functions are used to create and modify the settings of a connector based integration. Integration contains settings which stores user specific customizations or other information. integrator-extension supports three settings functions - persistSettings, refreshMetadata and changeEdition.

#### persistSettings
persistSettings function is invoked whenever settings are updated in the UI and they need to be saved to integration document. The changed settings are passed to this function for updation, etc. as required.

```js
/*
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *  
 *  _integrationId - _id of the integration being installed.
 *
 *  opts - this field contains the connector license related information.
 *  
 *  pending - a json object containing key value pairs of different fields involved in a setting that is being updated.
 *
 */

module.settings.persistSettings = function (options, callback) {
  /*
   *  settings function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred.
   *       
   *  response - {success: boolean, pending: {<updated key value pairs of different fields involved in a setting>}}
   */

  return callback(error, response)
}
```

#### refreshMetadata
refreshMetadata function is invoked when a user tries to refresh the metadata used by the integration and the new metadata values needed to be updated in integration settings.

```js
/*
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *  
 *  _integrationId - _id of the integration being installed.
 *
 *  opts - this field contains the connector license related information.
 *  
 *  also contains all the information related to the field whose metadata is being refreshed and new metadata.
 *
 */

module.settings.refreshMetadata = function (options, callback) {
  /*
   *  settings function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred.
   *       
   *  response - json object containing the information related to the field which also contains any changes done to new metadata.
   */

  return callback(error, response)
}
```

#### changeEdition
This function can be used to change license specific features and is invoked when there are changes to the user's connector license.

```js
/*
 * options object contains the following properties:
 *     
 *  bearerToken - a one-time bearer token which can be used to invoke selected integrator.io API routes.
 *  
 *  _integrationId - _id of the integration being installed.
 *
 *  opts - this field contains the connector license related information.
 *
 */

module.settings.changeEdition = function (options, callback) {
  /*
   *  settings function code
   */

  /*
   *  err - Error object to convey a fatal error has occurred.
   *       
   *  response - no response expected.
   */

  return callback(error, response)
}
```
