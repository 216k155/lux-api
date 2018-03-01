#!/usr/bin/env node
'use strict';

var util = require('util'),
  config  = require('../config/config');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var TransactionDb = require('../lib/TransactionDb.js').default();
var hash = process.argv[2] || '00000759bb3da130d7c9aedae170da8335f5a0d01a9007e4c8d3ccd08ace6a42';

var t= TransactionDb.fromIdWithInfo(hash,function(err,tx) {
  console.log('Err:');
  console.log(err);

  console.log('Ret:');
  console.log(util.inspect(tx,{depth:null}));
});

