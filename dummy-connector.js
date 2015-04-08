var setup = {
  runSetupErrorStep: function(userBearerToken, payload, callback) {
    console.log('running runSetupErrorStep!');
    callback(new Error('runSetupErrorStep'));
  },

  runSetupSuccessStep: function(userBearerToken, payload, callback) {
    console.log('running runSetupErrorStep!');
    callback(null, {success: true});
  }
}

exports.setup = setup;
