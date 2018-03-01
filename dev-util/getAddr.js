#!/usr/bin/env node
'use strict';

var util = require('util'),
  config  = require('../config/config');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var A = require('../app/models/Address');

// var hash = process.argv[2] || '00000759bb3da130d7c9aedae170da8335f5a0d01a9007e4c8d3ccd08ace6a42';
var hash = process.argv[2] || 'Ldsi32Hcu41MYgQJm2HJZHmP9Mg89vGGqw';

var a= new A(hash);
a.update(function(err) {
  console.log('Err:');
  console.log(err);

  console.log('Ret:');
  console.log(util.inspect(a,{depth:null}));

})

