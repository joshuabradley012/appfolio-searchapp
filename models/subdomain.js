var mongoose = require('mongoose');

if (process.env.MONGODB_URI) {
  dbUrl = process.env.MONGODB_URI;
} else {
  dbUrl = 'mongodb://localhost/listings'
}
mongoose.connect(dbUrl);

var Schema = mongoose.Schema;

var subdomainSchema = new Schema({
  url: {type: String, unique: true, index: true}
});

module.exports = mongoose.model('Subdomain', subdomainSchema);