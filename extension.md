# Integrator Extensions

Integrator extensions are custom code that can be used to customize various integrator.io functionalities. Currently
integrator.io supports the following extensions:

  * [Hooks](#hooks)
  * [Wrappers](#wrappers)

### Hooks

Hooks are custom code that can be executed at different stages during a flow run to customize the flow. Hooks can be categorized into two types - export hooks and import hooks.

#### Export hooks

Export hooks are the hooks that are executed during the export process of a flow run. Currently integrator supports
only one type of hook - preSavePage.

**preSavePage**

This hook gets invoked before saving the data that's fetched using export configuration for further processing. This
hook can be used to add or delete records or modify the existing records present in the data that is passed to
the hook preSavePage function.

```js
/*
 * options object in the preSavePageFunction contains the following properties:
 *      
 *   bearerToken       Is the one-time token that is passed by the integrator.io.
 *      
 *   data              Is an array of values(http://www.json.org/) which has been exported from the
 *                     export endpoint.
 *      
 *   errors            Is an array of JSON objects where each JSON object contains the code
 *                     and message of the error that occurred during the export process.
 *                     Format of each JSON object will be {message: 'error message', code: 'error code'}
 *
 *   _exportId         Is the _exportId of the flow for which the hook is defined.
 *
 *   settings          Is the container for all integrator.io settings data for an integration.
 */

module.hooks.preSavePageFunction = function (options, callback) {
  /*
   *  preSavePage function code
   */

  /*
   * The callback function expects takes in two arguments.
   *	 err                Error object to convey a fatal error has occurred.
   *
   *	 responseData       Response data is a JSON object which is of the below format:
   *                        { data: value, errors: [{code: 'error code', message: 'error message'}] }
   *                        data: Needs to be set to the modified data. Its structure is similar
   *                              to the data parameter that is sent to the preSavePage function.
   *                        errors: Needs to be set to the modified errors. Its structure is similar
   *                                to the data parameter that is sent to the preSavePage function.
   *                  
   */

  return callback(err, responseData)		
}
```

#### Import hooks

Import hooks are the hooks that are executed during the import process of a flow run. Currently integrator supports three types
of import hooks - preMap, postMap and postSubmit.

**preMap**

This hook gets invoked before the fields in the export record are mapped to their respective fields in import record. This hook can be used to reformat the record's data in a way that existing mapping functionality provided by integrator.io can be leveraged without modifying the number of records.


```js
/*
 * options object contains the following properties:
 *      
 *   bearerToken       Is the one-time token that is passed by the integrator.io.
 *      
 *   data              Is an array of values(http://www.json.org/) which will be used for mapping by integrator.io.                     
 *
 *   _importId         Is the _importId of the flow for which the hook is defined.
 *
 *   settings  	       Is the container for all integrator.io settings data for an integration.		
 */

module.hooks.preMapFunction = function (options, callback) {
  /*
   * preMap function code
   */

  /*
   * The callback function expects takes in two arguments.
   *	err              Error object to convey a fatal error has occurred.
   *
   *	responseData     Response data is an array of JSON objects where each JSON object can be in below three formats:
   *                     {data: value, errors: [{code: 'error code', message: 'error message'}]}
   *                     {errors:[{code: 'error code', message: 'error message'}]}
   *                     {}
   *                     Here empty JSON will convey integrator.io to ignore the record.
   *					 The data field can have any value as defined by http://www.json.org/.
   *                     
   */

  return callback(err, responseData)		
}
```

**postMap**

This hook gets invoked after the fields in the export record are mapped to their respective fields in import record. For an instance
if any further modification is required in mapped record without violating the data length constraint then this hook can be used.

```js
/*
 * options object contains the following properties:
 *      
 *   bearerToken       Is the one-time token that is passed by the integrator.io.
 *      
 *   preMapData        Is an array of values(http://www.json.org/) which will be used for mapping by integrator.io.
 *
 *   postMapData       Is an array of values(http://www.json.org/) which is obtained after the mapping has been
 *	                   performed by integrator.io based on the mapping configuration set for the flow.
 *      
 *   _importId         Is the _importId of the flow for which the hook is defined.
 *
 *   settings  	       Is the container for all integrator.io settings data for an integration.
 */

module.hooks.postMapFunction = function (options, callback) {
  /*
   *  postMap function code
   */

  /*
   * The callback function takes in two arguments.
   *	err              Error object to convey a fatal error has occurred.
   *
   *	responseData     Response data is an array where each element can be in below three JSON formats
   *                   mapping to each record:
   *                     { data: value, errors: [{ message: 'error message', code: 'error code' }] }
   *                     { errors:[{ message: 'error message', code: 'error code' }] }
   *                     {}
   *					 Here empty JSON will convey integrator.io to ignore the record.
   *                     The data field can have any value as defined by http://www.json.org/.
   *                     
   */

  return callback(err, responseData)		
}
```

**postSubmit**

This hook gets invoked after import records are submitted to the import endpoint and response is obtained from import side. It can
be used for manipulating the response data received from import for success and error cases.

```js
/*
 * options object contains the following properties:
 *      
 *   bearerToken       Is the one-time token that is passed by the integrator.io.
 *      
 *   preMapData        Is an array of values(http://www.json.org/) which will be used for mapping by integrator.io.
 *
 *   postMapData       Is an array of values(http://www.json.org/) which is obtained after the mapping has been
 *                     performed by integrator.io based on the mapping configuration set for the flow.
 *      
 *   responseData      Is an array of objects which corresponds to the response received by the import
 *                     after submitting the postMapData to the import endpoint.
 *
 *   _importId         Is the _importId of the flow in which the hook is defined.
 *
 *   settings  	       Is the container for all integrator.io settings data for an integration.
 */

module.hooks.postSubmitFunction = function (options, callback) {
  /*
   *  postSubmit function code
   */

  /*
   * The callback function takes in two arguments.
   *	err              Error object to convey a fatal error has occurred.
   *
   *	responseData     returnResponseData should have structure similar to responseData.
   *                     Must be of the same length as responseData.
   *
   */

  return callback(err, returnResponseData)		
}
```
---

### Wrappers

Wrappers are custom code that are used to bypass integrator logic. They allow you to build up a whole custom integrator.io
flow component(export, import and connection).

#### Ping

This wrapper function is to verify whether the connection defined for the wrapper type adaptor is valid.

```js
/* options object contains the following properties:
 *      
 *   bearerToken           Is the one-time token that is passed by the integrator.
 *      
 *   connection            Is the connection object containing the connection configuration which is:
 *                         connection: {encrypted: {...}, unencrypted: {...}}
 *                         encrypted object contains the private data needed to verify the connection with the endpoint.
 *                         unencrypted object contains the public data needed to verify the connetion with the endpoint.
 *   _importId/_exportId   _id of the export or import to which the connection belongs to.
 *
 */

module.wrappers.pingConnectionFunction = function (options, callback) {
  /*
   *    error         Error object to convey a fatal error has occurred.
   *        
   *    response      response object provides information about whether the wrapper function was able to
   *                  establish a connection with the endpoint.
   *                  response object contains two fields statusCode and errors.
   *                  if statusCode is 401 then the errors field needs to be set.
   *                  { statusCode: 200/401, errors: [{message: 'error message', code: 'error code'}]}
   */

  return callback(error, response)
}
```

#### Export

This wrapper function contains the complete logic of exporting data from an endpoint. This will substitute/override the actual
implementation of integrator.io export. The wrapper export function returns back pages of data and will be called by the integrator.io
until all the records have been returned to integrator.io.

```js
/*
 * options parameter in export functions contains the following fields:
 *
 *  bearerToken       Is the one-time token that is passed by the integrator.
 *
 *  Connection        Is the connection object containing the connection configuration which is:
 *                    connection: {encrypted: {...}, unencrypted: {...}}
 *                    encrypted object contains the private data needed to verify the connection with the endpoint.
 *                    unencrypted object contains the public data needed to verify the connection with the endpoint.
 *
 *  type              If this field is not set then the export type will be all. Else it will be set to either of
 *                    'delta', 'type' or 'once'.
 *  
 *  delta             This field is set only when export type is delta and contains a JSON object having the below properties:
 *                    dateField: The field to be used to determine whether the record has to be picked.
 *                    lastExecutionTime: Is the date on which last job was run in milliseconds.
 *
 *  once              This field is set only when export type is once and contains a JSON object having the below properties:
 *                    booleanField: The boolean field to be used to determine whether the record has to be picked.
 *
 *  test              This field is set only when export type is test and contains a JSON object having the below properties:
 *                    limit: The maximum number of records that can be fetched.
 *
 *  state             Information provided by the previous call to the wrapper function during a export process.
 *
 *  _exportId         _id of the wrapper export.
 *
 *  settings          Is the container for all integrator.io settings data for an integration.
 *
 *  configuration     The configuration provided for the wrapper export.
 */

module.wrappers.exportFunction = function (options, callback) {
  /*
   *    error         Error object to convey a fatal error has occurred.
   *        
   *    response      The response should contain a JSON object where following properties are set:
   *                  connectionOffline: A boolean value to specify whether connection is offline or online.
   *                  data: An array of values(http://www.json.org/) where each value is a record that has been exported.
   *                  errors: An array of JSON objects where each element represents error information in the format:
   *                          {message: 'error message', code: 'error code'} that occured during the export.
   *                  lastPage: A boolean field which is used to convey integrator.io that this is the last
   *                            page of the export process.
   *                  state: An object which can be used to specify the current state of the export process
   *                         which will be used by the next call to the wrapper function.
   */

  return callback(error, response)
}
```
**Note:** No further calls will be made to a wrapper function if same response is sent more than 5 times to integrator.io during an export process by the wrapper function.

#### Import

This wrapper function contains the complete logic of importing data to an endpoint. This will substitute/override the actual
implementation of integrator.io import.
```js
/* options object contains the following properties:
 *      
 *      bearerToken           Is the one-time token that is passed by the integrator.io.
 *      
 *      connection            Is the connection object containing the connection configuration which is:
 *                            connection: {encrypted: {...}, unencrypted: {...}}
 *                            encrypted object contains the private data needed to verify the connection with the endpoint.
 *                            unencrypted object contains the public data needed to verify the connection with the endpoint.
 *
 *      preMapData            Is an array of values(http://www.json.org/) which will be used for mapping by
 *                            integrator.io.
 *
 *      postMapData           Is an array of values(http://www.json.org/) which is obtained after the mapping has been
 *                            performed by integrator.io based on the mapping configuration set for the flow.
 *
 *      _importId             _id of the wrapper import.
 *
 *      settings              Is the container for all integrator.io settings data for an integration.
 *
 *      configuration         The configuration provided for the wrapper import.
 */

module.wrappers.importFunction = function (options, callback) {
  /*
   *    error         Error object to convey a fatal error has occurred.
   *        
   *    response      Response is an array of JSON objects where each object should follow the below format:  
   *                  {statusCode: 200/401/422, id: string, ignored: boolean, errors: [{code, message}]}
   *                  
   *                  statusCode: should be set to 200 when the import was successful for the given, 401 when
   *                              the operation was unauthorized and 422 when an error occurred during the process.
   *                  id: The id of the record.
   *                  ignored: Is set to true when the field is ignored by the import.
   *                  errors: Is an array of JSON objects representing the list of the errors that occurred while
   *                          importing the records.
   *                          [{message: 'error message', code: 'error code'}]
   */

  return callback(error, response)
}
```
