const Subdomain = require('../models/subdomain.js');

async function saveSubdomain(options, callback) {
	new Subdomain(options.subdomain).save().then(callback()).catch((err)=>{
	  console.log(err.message);
	});
}

module.exports = saveSubdomain;