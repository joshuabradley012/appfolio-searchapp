var mongoose = require('mongoose');

if (process.env.MONGODB_URI) {
	dbUrl = process.env.MONGODB_URI;
} else {
	dbUrl = 'mongodb://localhost/listings'
}
mongoose.connect(dbUrl);

var Schema = mongoose.Schema;

var listingSchema = new Schema({
  url: {type: String, unique: true, index: true},
  img: {type: String, unique: false, index: true},
  address: {type: String, unique: false, index: true},
  rent: {type: Number, unique: false, index: true},
  size: {type: String, unique: false, index: true},
  text: {type: String, unique: false, text: true, index: true}
});

//listingSchema.index({url: 1, img: 1, address: 1, rent: 1, size: 1, text: 'text'});

module.exports = mongoose.model('Listing', listingSchema);