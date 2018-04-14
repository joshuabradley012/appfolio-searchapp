const Subdomain = require('../models/subdomain.js');

async function getSubdomains(callback) {
  try {
    Subdomain.find({}, 'url', function(err, res){
      if (err) {
        console.log(err);
        callback(err);
      }
      else {
        console.log(res);
        callback(res);
      }
    });
  } catch(err) {
    return null;
  }
}

module.exports = getSubdomains;