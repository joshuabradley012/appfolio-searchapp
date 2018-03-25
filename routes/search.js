var express = require('express');
var router = express.Router();
var search = require('../middleware/search');
require('express-async-errors');

/* GET search page. */
router.get('/', async(req, res, next) => {
  res.json(await search({search: 'section 8', subdomains: 'rohcs, solarentals'}));
});

module.exports = router;
