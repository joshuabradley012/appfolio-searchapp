var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/listings');

var Schema = mongoose.Schema;

var subdomainSchema = new Schema({
  url: {type: String, unique: true, index: true}
});

module.exports = mongoose.model('Subdomain', subdomainSchema);