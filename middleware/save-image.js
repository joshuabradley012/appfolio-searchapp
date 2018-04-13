/**
 * Module dependencies
 */

var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var request = require('request');
var http = require('http');
var Schema = mongoose.Schema;
var app = express();

mongoose.connect('mongodb://localhost/listings');

var schema = new Schema({
  img: { data: Buffer, contentType: String }
});

var A = mongoose.model('A', schema);

mongoose.connection.on('open', function() {
  console.error('mongo is open');

  A.remove(function(err) {
    if (err) throw err;

    console.error('removed old docs');

    request({
      url: 'https://pa.cdn.appfolio.com/rohcs/images/239ac35e-ba51-42dc-bdd5-b38a771773c1/large.jpg',
      encoding: 'binary'
    }, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        body = new Buffer(body, 'binary');

        var a = new A;
        a.img.data = body
        a.img.contentType = 'image/png';
        a.save(function(err, a) {
          if (err) throw err;

          console.error('saved img to mongo');

          app.get('/', function(req, res, next) {
            A.findById(a, function(err, doc) {
              if (err) return next(err);
              res.contentType(doc.img.contentType);
              res.send(doc.img.data);
            });
          });

          app.on('close', function() {
            console.error('dropping db');
            mongoose.connection.db.dropDatabase(function() {
              console.error('closing db connection');
              mongoose.connection.close();
            });
          });

          app.listen(3333, function(err) {
            console.error('press CTRL+C to exit');
          });

          process.on('SIGINT', function() {
            server.close();
          });
        });
      }
    });
  });
});