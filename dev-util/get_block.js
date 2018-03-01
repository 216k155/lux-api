#!/usr/bin/env node
'use strict';

var util = require('util');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var RpcClient = require('../node_modules/lux-core-api/RpcClient');

var config = require('../config/config');


 var hash = process.argv[2] || '00000759bb3da130d7c9aedae170da8335f5a0d01a9007e4c8d3ccd08ace6a42';

//hash = '00000759bb3da130d7c9aedae170da8335f5a0d01a9007e4c8d3ccd08ace6a42';

var rpc   = new RpcClient(config.bitcoind);

rpc.getBlock( hash,  function(err, ret) {

  console.log('Err:');
  console.log(err);


  console.log('Ret:');
  console.log(util.inspect(ret, { depth: 10} ));
});

