var request = require('request');

exports.postRequest = function(uri, json, callback, bearerToken) {
  var requestOptions = {
    uri: uri,
    json : json,
    method : 'POST',
    auth: {
      bearer: bearerToken
    }
  };

  request(requestOptions, function(error, res, body) {
    return callback(error, res, body);
  });
}

exports.putRequest = function(uri, json, callback, bearerToken) {
  var requestOptions = {
    uri: uri,
    json : json,
    method : 'PUT',
    auth: {
      bearer: bearerToken
    }
  };

  request(requestOptions, function(error, res, body) {
    return callback(error, res, body);
  });
}

exports.getRequest = function(uri, callback, bearerToken) {
  var requestOptions = {
    uri: uri,
    method : 'GET',
    json : true,
    auth: {
      bearer: bearerToken
    }
  };

  request(requestOptions, function(error, res, body) {
    return callback(error, res, body);
  });
}

exports.deleteRequest = function(uri, callback, bearerToken) {
  var requestOptions = {
    uri: uri,
    method : 'DELETE',
    json: true,
    auth: {
      bearer: bearerToken
    }
  };

  request(requestOptions, function(error, res, body) {
    return callback(error, res, body);
  });
}
