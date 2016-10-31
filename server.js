/**
 * Created by daniele on 31/10/16.
 */
var cluster = require('cluster');
var http = require('http');
var sticky = require('sticky-session');
var WebSocketServer = require('ws').Server;
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Worker | ' +process.pid+' | '+cluster.worker.id);
});

var server = require('http').createServer(app);

/**
 * Create Web Socket.
 */
var wsServer = new WebSocketServer({ server: server });

/**
 * Listen on web socket connection, on all network interfaces.
 */

wsServer.on('connection', connection);

/**
 * Event listener new connection.
 */

function connection(ws) {
    //var location = url.parse(ws.upgradeReq.url, true);

    console.log("create new connection");
    ws.send('something');

    ws.on('message', function incoming(message) {
        console.log('Worker | ' +process.pid+' | '+cluster.worker.id+'| '+ 'received: %s', message);
        wsServer.broadcast("broadcast");
    });
}

/**
 * Send broadcast messages.
 */

wsServer.broadcast = function(data){
    for(var i in this.clients)
        this.clients[i].send(data);
};

if (!sticky.listen(server, 3000)) {
    // Master code
    server.once('listening', function() {
        console.log('server started on 3000 port');
    });

} else {
    // Worker code
    console.log("process with pid:"+process.pid);
}