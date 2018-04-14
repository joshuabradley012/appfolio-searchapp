const Listing = require('../models/listing.js');

async function findListings(options, callback) {
  try {

    if (options.sort == 'least') {
      var sortBy = {rent: 1};
    } else if (options.sort == 'most') {
      var sortBy = {rent: -1};
    } else if (options.sort == 'relevance') {
      var sortBy = {score: { $meta: 'textScore' } };
    }

    const search = options.search;
    Listing.find({$text: {$search: search}}, {score: { $meta: 'textScore' } }, function(err, res){
      if (err) {
        console.log(err);
        callback(err);
      }
      else {
        console.log(res);
        callback(res);
      }
    }).sort(sortBy);
  } catch(err) {
    return null;
  }
}

module.exports = findListings;