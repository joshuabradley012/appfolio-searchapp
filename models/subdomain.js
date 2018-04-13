var mongoose = require('mongoose');

if (process.env.MONGODB_URI) {
	connection = process.env.MONGODB_URI;
} else {
	connection = 'mongodb://localhost/listings'
}

var Schema = mongoose.Schema;

var subdomainSchema = new Schema({
  url: {type: String, unique: true, index: true}
});

module.exports = mongoose.model('Subdomain', subdomainSchema);