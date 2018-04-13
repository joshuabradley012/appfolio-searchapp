var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/listings');

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