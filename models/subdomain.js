var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

var Schema = mongoose.Schema;

var subdomainSchema = new Schema({
  url: {type: String, unique: true, index: true}
});

module.exports = mongoose.model('Subdomain', subdomainSchema);