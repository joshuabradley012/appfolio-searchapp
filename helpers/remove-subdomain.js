const Subdomain = require('../models/subdomain.js');

async function removeSubdomain(options, callback) {
  Subdomain.remove({ url: options.url }, function (err) {
    if (err) return handleError(err);
  }).then(callback());
}

module.exports = removeSubdomain;