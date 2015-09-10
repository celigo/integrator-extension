'use strict'

var logger = require('winston')

var installer = {
  connectorInstallerFunction: function(options, callback) {
    options.function = 'connectorInstallerFunction'
    return callback(null, options)
  },

  runInstallerErrorStep: function(options, callback) {
    return callback(new Error('runInstallerErrorStep'))
  },

  runInstallerSuccessStep: function(options, callback) {
    options.function = 'runInstallerSuccessStep'
    return callback(null, options)
  },

  connectorUpdateFunction: function(options, callback) {
    options.function = 'connectorUpdateFunction'
    return callback(null, options)
  },

  notAFunction: 'not_a_func'
}

var uninstaller = {
  connectorUninstallerFunction: function(options, callback) {
    options.function = 'connectorUninstallerFunction'
    return callback(null, options)
  },

  runUninstallerErrorStep: function(options, callback) {
    return callback(new Error('runUninstallerErrorStep'))
  },

  runUninstallerSuccessStep: function(options, callback) {
    options.function = 'runUninstallerSuccessStep'
    return callback(null, options)
  }
}

var setup = {
  initialize: function(options, callback) {
    options.function = 'initialize'
    return callback(null, options)
  },

  runSetupErrorStep: function(options, callback) {
    return callback(new Error('runSetupErrorStep'))
  },

  runSetupSuccessStep: function(options, callback) {
    options.function = 'runSetupSuccessStep'
    return callback(null, options)
  },

  notAFunction: 'not_a_func'
}

var settings = {
  persistSettings: function(options, callback) {
    if (options.error) {
      return callback(new Error('persistSettings'))
    }

    options.function = 'persistSettings'
    return callback(null, options)
  },

  refreshMetadata: function(options, callback) {
    options.function = 'refreshMetadata'
    return callback(null, options)
  }
}

var hooks = {
  doSomethingError: function(options, callback) {
    var error = new Error('doSomethingError')
    error.name = 'my_error'

    return callback(error)
  },

  doSomething: function(options, callback) {
    options.function = 'doSomething'
    return callback(null, [options])
  },

  echoResponse: function(options, callback) {
    return callback(null, options.resp)
  },

  respondWithNonSearializableObject: function(options, callback) {
    return callback(null, {
      a: 'b',
      date: new Date()
    })
  },

  preMapFunction: function(options, callback) {
    var data = options.data
      , resp = []
    for (var i = 0; i < data.length; i++) {
      if (data[i].errors) {
        resp.push({errors: data[i].errors})
      } else {

        data[i].processedPreMap = true
        resp.push({data: data[i]})
      }
    }

    return callback(null, resp)
  },

  postMapFunction: function(options, callback) {
    var data = options.postMapData
      , resp = []
    for (var i = 0; i < data.length; i++) {
      data[i].processedPostMap = true
      resp.push({data: data[i]})
    }

    return callback(null, resp)
  },

  postSubmitFunction: function(options, callback) {
    var data = options.responseData
    for (var i = 0; i < data.length; i++) {
      if (data[i].id) {
        data[i].id = data[i].id + '-postSubmit'
      }
    }

    return callback(null, data)
  },

  preSavePageFunction: function(options, callback) {
    var data = options.data
    for (var i = 0; i < data.length; i++) {
      data[i].processedPreSavePage = true
    }

    return callback(null, {data: data, errors: options.errors})
  }
}

var wrappers = {
  pingOptions: function(options, callback) {
    return callback(null, options)
  },

  pingSuccess: function(options, callback) {
    return callback(null, {statusCode: 200})
  },

  pingStringStatusCode: function(options, callback) {
    return callback(null, {statusCode: '200'})
  },

  pingError: function(options, callback) {
    return callback(null, {statusCode: 401, errors: [{code: 'pingCode', message: 'pingMessage'}]})
  },

  importOptions: function(options, callback) {
    //lets pass the options back via id for validation!
    return callback(null, [{statusCode: 200, id: options}])
  },

  returnVariousImportResponses: function(options, callback) {

    var toReturn = [
        {statusCode: 200}
      , {statusCode: 200, id:'myId1'}
      , {statusCode: 200, id:'myId2', errors: [{code:'c1', message: 'm1'}]}
      , {statusCode: 422, errors: [{code:'c1', message: 'm1'}]}
      , {statusCode: 401, errors: [{code:'c2', message: 'm2'}]}
    ]

    return callback(null, toReturn)
  },

  returnStringStatusCodeInImportResponse: function(options, callback) {
    return callback(null, [{statusCode: '200'}])
  },

  returnDataValueAsIdImport: function(options, callback) {
    // logger.info(options.data)
    var data = options.data
    var toReturn = []

    for (var i = 0; i < data.length; i++) {
      toReturn.push({statusCode: 200, id: {data: data[i], isArray: Array.isArray(data[i])}})
    }

    return callback(null, toReturn)
  },

  returnBadImportResponseWithNoStatusCode: function(options, callback) {
    return callback(null, [{id:'myId1'}])
  },

  exportOptions: function(options, callback) {
    //lets pass the options back via data for validation!
    return callback(null, {data: [{options: options}], lastPage: true})
  },

  echoExportResponseFromState: function(options, callback) {
    return callback(null, options.state.resp)
  },

  exportArrayOfArrays: function(options, callback) {
    var toReturn = [
      [
        {
          "amount": {
            "value": "10.85"
          },
          "customer": {
            "variable": {
              "internalId": "13"
            }
          }
        },{

          "amount": {
            "value": "16"
          },
          "customer": {
            "variable": {
              "internalId": "42"
            }
          }
        }
      ]
      ,[
        {
          "test": true,
          "orders": [
            {
              "team": "giants",
              "right": 2
            },{
              "team": "49ers",
              "left": 3
            }
          ]
        },{
          "templeton": 14
        }
      ]
    ]

    return callback(null, {data: toReturn, lastPage: true})
  },

  exportArrayOfObjectsContainingArrays: function(options, callback) {
    var toReturn = [
      {
        subObj : [
          {
            "name":"charlie",
            "value":16
          }, {
            "name":"logan",
            "value":25
          }
        ]
      }, {
        subObj : [
          {
            "name":"scott",
            "value":1
          } , {
            "name":"jean",
            "value":2
          }, {
            "name":"bobby",
            "value":3
          }
        ]
      }
    ]

    return callback(null, {data: toReturn, lastPage: true})
  },

  importArrayOfArrays: function(options, callback) {
    logger.info(options.data)
    var data = options.data
    var toReturn = []

    if( !Array.isArray(data) ) {
      return callback(null, {statusCode: 500, errors: [{code:'DataError', message: 'data passed to wrapper should be Array'}]})
    }

    for (var i = 0; i < data.length; i++) {
      var objToReturn = {
        id: {
          data: i,
          isArray: Array.isArray(data[i])
        }
      }

      if(objToReturn.id.isArray) {
        objToReturn.statusCode = 200
      } else {
        objToReturn.statusCode = 422
      }
      toReturn.push(objToReturn)
    }
    return callback(null, toReturn)
  },

  importArrayOfObjectsContainingArrays: function(options, callback) {
    logger.info(options.data)
    var data = options.data
    var toReturn = []

    if( !Array.isArray(data) ) {
      return callback(null, {statusCode: 500, errors: [{code:'DataError', message: 'data passed to wrapper should be Array'}]})
    }

    for (var i = 0; i < data.length; i++) {
      var objToReturn = {
        id: {
          data: i,
          isObject: 'object' === typeof data[i],
          objectContainsArray: Array.isArray(data[i].subObj)
        }
      }

      if(objToReturn.id.isObject && objToReturn.id.objectContainsArray) {
        objToReturn.statusCode = 200
      } else {
        objToReturn.statusCode = 500
      }
      toReturn.push(objToReturn)
    }
    return callback(null, toReturn)
  },
}

exports.setup = setup // Legacy .. will be removed
exports.installer = installer
exports.uninstaller = uninstaller
exports.settings = settings
exports.hooks = hooks
exports.wrappers = wrappers
