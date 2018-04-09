var express = require('express');
var router = express.Router();
var searchListings = require('../middleware/search-listings');

router.get('/', function(req, res, next) {
  res.render('search');
});

router.post('/', function(req, res, next) {
  searchListings({ search: req.body.search }, (callback) => {
  		res.render('listings', {listings: callback, search: req.body.search});
  });
});

module.exports = router;