var express = require('express');
var router = express.Router();
var search = require('../middleware/search');
require('express-async-errors');

/* GET search page. */
router.get('/', function(req, res, next) {
  res.render('search');
});

router.post('/', function(req, res, next) {
	res.render('index');
	//res.json(await search({search: req.body.search, subdomains: req.body.subdomains}));
});

module.exports = router;