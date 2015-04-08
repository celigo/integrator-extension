var setup = {
  runSetupErrorStep: function(userBearerToken, payload, callback) {
    console.log('running runSetupErrorStep!');
    callback(new Error('runSetupErrorStep'));
  },

  runSetupSuccessStep: function(userBearerToken, payload, callback) {
    console.log('running runSetupSuccessStep!');
    callback(null, {userBearerToken: userBearerToken, payload: payload});
  }
}

exports.setup = setup;
