var express = require('express');
var router = express.Router();
var scrapeAppfolio = require('../middleware/scrape-appfolio');
var searchListings = require('../middleware/search-listings');
var addSubdomain = require('../middleware/add-subdomain');
var removeSubdomain = require('../middleware/remove-subdomain');
var getSubdomains = require('../middleware/get-subdomains');

router.get('/', function(req, res, next) {
  getSubdomains((currentSubdomains) => {
    res.render('search', { subdomains: currentSubdomains });
  });
});

router.post('/', function(req, res, next) {
  getSubdomains((currentSubdomains) => {
    searchListings({ search: req.body.search, sort: req.body.sort }, (results) => {
      res.render('search', { listings: results, search: req.body.search, subdomains: currentSubdomains, sort: req.body.sort });
    });
  });
});

router.post('/remove-subdomain', function(req, res) {
  removeSubdomain({ url: req.body.url }, (callback) => {});
});

router.post('/add-subdomain', function(req, res) {
  addSubdomain({ subdomain: { url: req.body.subdomain } }, (callback) => {});
});

router.post('/scrape', function(req, res) {
  getSubdomains((savedSubdomains) => {
    scrapeAppfolio({subdomains: savedSubdomains});
  })
});

module.exports = router;