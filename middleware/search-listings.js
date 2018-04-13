const Listing = require('../models/listing.js');

async function findListings(options, callback) {
  try {
    const search = options.search;
    Listing.find({$text: {$search: search}}, 'url img address rent size text', function(err, res){
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

module.exports = findListings;