#!/usr/bin/env node
'use strict';

var util = require('util');
var mongoose= require('mongoose'),
  config  = require('../config/config');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var T = require('../app/models/TransactionOut');


// var hash = process.argv[2] || '00000759bb3da130d7c9aedae170da8335f5a0d01a9007e4c8d3ccd08ace6a42';
var hash = process.argv[2] || '00000759bb3da130d7c9aedae170da8335f5a0d01a9007e4c8d3ccd08ace6a42';




mongoose.connect(config.db);

mongoose.connection.on('error', function(err) { console.log(err); });


mongoose.connection.on('open', function() {

  var b = new Buffer(hash,'hex');

  T.createFromTxs([hash], function(err, ret) {

    console.log('Err:');
    console.log(err);


    console.log('Ret:');
    console.log(util.inspect(ret,{depth:null}));
    mongoose.connection.close();
  });
});

