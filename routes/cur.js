/* Module dependencies. */
const app = require('../app');
const express = require('express');
const router = express.Router();    
const mongoose = require('mongoose');
const cors = require('cors');                               // Proxy to deal with CORS https://dev-academy.com/angular-cors/


// Mongo URI - for local testing, but can read from envirionment if you want to change it there -- 
// const mongoUrl = 'mongodb://localhost:27017/';
// MONGO_URI=mongodb://localhost:27017/DevGeneric&& node bin/www
// MONGO_LOC=mongodb://localhost:27017/DevGeneric
const  mongoUrl =process.env.MONGO_LOC;
const dataBaseName = process.env.MONGO_DB

// Debug to see what we got from the environment
console.log(`\r\ncur.js: mongoUrl: ${mongoUrl} `);
console.log(`dbname: ${dataBaseName} `);

// Create mongo connection
// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useUnifiedTopology', true);

// Allow cross origin (server/client same hostname)
//app.use(cors());                                            

/**
 * Get port from environment '.env' FILE and store in Express.
 */
var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

/* Create HTTP server. */
var server = http.createServer(app);


/* Listen on provided port, on all network interfaces. */
util.connectMongoose(url, function () {
    console.log(`cur.js: Starting **** Mongoose **** HTTP server at PORT:${port}`);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
});


var ioServer = require('socket.io')(server) // 'http://localhost:5020');
var ioClient = require('socket.io-client')('http://localhost:8080/api/v0.1.0');
var hbId = null;
var tdId = null;


// Establish Websocket connection.
ioServer.on('connection', socket => {

    console.log(`socket.io server is connected! ID: ${socket.id} `);

    socket.on('status start', () => {
        console.log(`socket.io status: ${socket.id} `);
        //hbId = heartbeats();
    });

    socket.on('tagdata', tags => {
        console.log("TAGS: " + tag);
        //tdId = recentDataFromTags(tags);
    })

    socket.on('status stop', () => {
        console.log("Clearing interval for looking at heartbeats...");
        //clearInterval(hbId);
    })

    socket.on('tagdata stop', () => {
        if (tdId != null) {
            console.log("Clearing interval for recent tag data...");
        //    clearInterval(tdId);
        }
    })

});

/* Normalize a port into a number, string, or false. */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}


// export to be imported in app.js
module.exports = router;