/**
 * Search through database of Appfolio Listings
 * ./appfolio-searchapp//middleware/search-listings.js
 * 03.19.2018
 * Josh Bradley
 * 
 * @requires puppeteer
 */

/**
 * Dependencies
 */

const Listing = require('../models/listing.js');

/**
 * Search
 */

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