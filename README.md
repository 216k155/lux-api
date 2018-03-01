# *lux-api API*

*lux-api API* is an open-source lux blockchain REST
and websocket API. lux-api API runs in NodeJS and uses LevelDB for storage.

This is a backend-only service. If you're looking for a web frontend application,
take a look at our official blockchain explorer [lux-api](https://github.com/216k155/lux-api).

*lux-api API* allows everyone to develop lux-related applications (such as wallets) that
require certain information from the blockchain that luxd does not provide.


## Prerequisites

* **luxd** - Download and install [lux](https://github.com/216k155/lux).

*lux-api API* needs a *trusted* luxd node to run. *lux-api API* will connect to the node
through the RPC API, lux peer-to-peer protocol, and will even read its raw block .dat files for syncing.

Configure luxd to listen to RPC calls and set `txindex` to true. luxd must be running and must have
finished downloading the blockchain **before** running *lux-api API*.

* **Node.js v0.10.x** - Download and Install [Node.js](http://www.nodejs.org/download/).

* **NPM** - Node.js package manager, should be automatically installed when you get Node.js.


## Quick Install
  Check the Prerequisites section above before installing.

  To install *lux-api API*, clone the main repository:

    $ git clone https://github.com/216k155/lux-api.git && cd lux-api

  Install dependencies:

    $ npm install

  Run the main application:

    $ node insight.js

  Then open a browser and go to:

    http://localhost:3000

  Please note that the app will need to sync its internal database
  with the blockchain state, which may take some time. You can check
  sync progress at http://localhost:3000/api/sync.


## Configuration

All configuration is specified in the [config](config/) folder, particularly the [config.js](config/config.js) file.
There you can specify your application name and database name. Certain configuration values are pulled from environment
variables if they are defined:

```
BITCOIND_HOST         # RPC luxd host
BITCOIND_PORT         # RPC luxd Port
BITCOIND_P2P_HOST     # P2P luxd Host (will default to BITCOIND_HOST, if specified)
BITCOIND_P2P_PORT     # P2P luxd Port
BITCOIND_USER         # RPC username
BITCOIND_PASS         # RPC password
BITCOIND_DATADIR      # luxd datadir. 'testnet' will be appended automatically if testnet is used. NEED to finish with '/'. e.g: `/vol/data/`
INSIGHT_NETWORK [= 'livenet' | 'testnet']
INSIGHT_PORT          # insight api port
INSIGHT_DB            # Path where to store the internal DB. (defaults to $HOME/.lux-api)
INSIGHT_SAFE_CONFIRMATIONS=6  # Nr. of confirmation needed to start caching transaction information
INSIGHT_IGNORE_CACHE  # True to ignore cache of spents in transaction, with more than INSIGHT_SAFE_CONFIRMATIONS confirmations. This is useful for tracking double spents for old transactions.
ENABLE_MAILBOX # if "true" will enable mailbox plugin
ENABLE_CLEANER # if "true" will enable message db cleaner plugin
ENABLE_MONITOR # if "true" will enable message db monitor plugin
ENABLE_EMAILSTORE # if "true" will enable a plugin to store data with a validated email address
ENABLE_RATELIMITER # if "true" will enable the ratelimiter plugin
LOGGER_LEVEL # defaults to 'info', can be 'debug','verbose','error', etc.
ENABLE_HTTPS # if "true" it will server using SSL/HTTPS

```

Make sure that luxd is configured to [accept incoming connections using 'rpcallowip'](https://en.bitcoin.it/wiki/Running_Bitcoin).

In case the network is changed (testnet to livenet or vice versa) levelDB database needs to be deleted. This can be performed running:
```util/sync.js -D``` and waiting for *lux-api API* to synchronize again.  Once the database is deleted,
the sync.js process can be safely interrupted (CTRL+C) and continued from the synchronization process embedded in main app.


## Synchronization

The initial synchronization process scans the blockchain from the paired luxd server to update addresses and balances.
*lux-api* needs exactly one trusted luxd node to run. This node must have finished downloading the blockchain
before running *lux-api*.

While *lux-api* is synchronizing the website can be accessed (the sync process is embedded in the webserver),
but there may be missing data or incorrect balances for addresses. The 'sync' status is shown at the `/api/sync` endpoint.

The blockchain can be read from luxd's raw `.dat` files or RPC interface.
Reading the information from the `.dat` files is much faster so it's the
recommended (and default) alternative. `.dat` files are scanned in the default
location for each platform (for example, `~/.lux` on Linux). In case a
non-standard location is used, it needs to be defined (see the Configuration section).

While synchronizing the blockchain, *lux-api* listens for new blocks and
transactions relayed by the luxd node. Those are also stored on *lux-api*'s database.
In case *lux-api* is shutdown for a period of time, restarting it will trigger
a partial (historic) synchronization of the blockchain. Depending on the size of
that synchronization task, a reverse RPC or forward `.dat` syncing strategy will be used.

If luxd is shutdown, *lux-api* needs to be stopped and restarted
once luxd is restarted.


### Syncing old blockchain data manually

  Old blockchain data can be manually synced issuing:

    $ util/sync.js

  Check util/sync.js --help for options, particularly -D to erase the current DB.

  *NOTE*: there is no need to run this manually since the historic synchronization
  is built in into the web application. Running *lux-api* normally will trigger
  the historic sync automatically.


### DB storage requirement

To store the blockchain and address related information, *lux-api* uses LevelDB.
Two DBs are created: txs and blocks. By default these are stored on

  ``~/.lux-api/``

This can be changed at config/config.js.


## Development

To run *lux-api* locally for development with grunt:

```$ NODE_ENV=development grunt```

To run the tests

```$ grunt test```


Contributions and suggestions are welcome at [lux-api-api github repository](https://github.com/216k155/lux-api).

## Caching schema

Since v0.2 a new cache schema has been introduced. Only information from transactions with
INSIGHT_SAFE_CONFIRMATIONS settings will be cached (by default SAFE_CONFIRMATIONS=6). There
are 3 different caches:
 * Number of confirmations
 * Transaction output spent/unspent status
 * scriptPubKey for unspent transactions

Cache data is only populated on request, i.e., only after accessing the required data for
the first time, the information is cached, there is not pre-caching procedure.  To ignore
cache by default, use INSIGHT_IGNORE_CACHE. Also, address related calls support `?noCache=1`
to ignore the cache in a particular API request.

## API

By default, *lux-api* provides a REST API at `/api`, but this prefix is configurable from the var `apiPrefix` in the `config.js` file.

The end-points are:


### Block
```
  /api/block/[:hash]
  /api/block/0
```
### Transaction
```
  /api/tx/[:txid]
  /api/tx/0
```
### Address
```
  /api/addr/[:addr][?noTxList=1&noCache=1]
  /api/addr/0?noTxList=1
```
### Address Properties
```
  /api/addr/[:addr]/balance
  /api/addr/[:addr]/totalReceived
  /api/addr/[:addr]/totalSent
  /api/addr/[:addr]/unconfirmedBalance
```
The response contains the value in Satoshis.
### Unspent Outputs
```
  /api/addr/[:addr]/utxo[?noCache=1]
```
Sample return:
``` json
[
    {
      address: "0",
      txid: "0",
      vout: 0,
      ts: 0,
      scriptPubKey: "0",
      amount: 0.001,
      confirmations: 3
    },
    {
      address: "0",
      txid: "0",
      vout: 0,
      ts: 1401226410,
      scriptPubKey: "0",
      amount: 0.001,
      confirmation: 6
      confirmationsFromCache: true,
    }
]
```
Please note that in case confirmations are cached (which happens by default when the number of confirmations is bigger
that INSIGHT_SAFE_CONFIRMATIONS) the response will include the pair confirmationsFromCache:true, and confirmations will
equal INSIGHT_SAFE_CONFIRMATIONS. See noCache and INSIGHT_IGNORE_CACHE options for details.

### Historic blockchain data sync status
```
  /api/sync
```

### Live network p2p data sync status
```
  /api/peer
```

### Status of the lux network
```
  /api/status?q=xxx
```

Where "xxx" can be:

 * getInfo
 * getDifficulty
 * getTxOutSetInfo
 * getBestBlockHash
 * getLastBlockHash

## Web Socket API
The web socket API is served using [socket.io](http://socket.io).

The following are the events published by *lux-api API*:

'tx': new transaction received from network. This event is published in the 'inv' room. Data will be a app/models/Transaction object.
Sample output:
```
{
  "txid":"0",
  "processed":false
  ...
}
```


'block': new block received from network. This event is published in the 'inv' room. Data will be a app/models/Block object.
Sample output:
```
{
  "hash":"0",
  "time":0,
  ...
}
```

'<luxAddress>': new transaction concerning <luxAddress> received from network. This event is published in the '<luxAddress>' room.

'status': every 1% increment on the sync task, this event will be triggered. This event is published in the 'sync' room.

Sample output:
```
{
  blocksToSync: 164141,
  syncedBlocks: 475,
  upToExisting: true,
  scanningBackward: true,
  isEndGenesis: true,
  end: "0",
  isStartGenesis: false,
  start: "0"
}
```

### Example Usage

The following html page connects to the socket.io lux-api API and listens for new transactions.

html
```
<html>
<body>
  <script src="http://explorer.luxcore.io/socket.io/socket.io.js"></script>
  <script>
    eventToListenTo = 'tx'
    room = 'inv'

    var socket = io("http://explorer.luxcore.io/");
    socket.on('connect', function() {
      // Join the room.
      socket.emit('subscribe', room);
    })
    socket.on(eventToListenTo, function(data) {
      console.log("New transaction received: " + data.txid)
    })
  </script>
</body>
</html>
```

## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
