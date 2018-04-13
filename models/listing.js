var mongoose = require('mongoose');

if (process.env.MONGODB_URI) {
	connection = process.env.MONGODB_URI;
} else {
	connection = 'mongodb://localhost/listings'
}

mongoose.connect(connection);

var Schema = mongoose.Schema;

var listingSchema = new Schema({
  url: {type: String, unique: true, index: true},
  img: {type: String, unique: false, index: true},
  address: {type: String, unique: false, index: true},
  rent: {type: Number, unique: false, index: true},
  size: {type: String, unique: false, index: true},
  text: {type: String, unique: false, index: true, text: true}
});

module.exports = mongoose.model('Listing', listingSchema);