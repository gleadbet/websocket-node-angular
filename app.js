const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')

const { router } = require('./app_api/_config')
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Environment variables
// Read .env file -- could work here but you dont want in Docker if Docker will provide
//   -- only local -- use it in package.json
// https://nodejs.dev/learn/how-to-read-environment-variables-from-nodejs
// npm install dotenv --save
require('dotenv').config();

// Note: process does not require a "require", it's automatically available.
//-- added for debugging  **** Note ***** Create these in a .env file (look at .env.example)
// var whitelist=["http://localhost","http://localhost:80","http://camv-d10dfdev1", "http://camv-d10dfdev1:80"]
// This file sets the ports/url/etc. -- but needs values exported?
require('./envConfig');

// Mongo URI - for local testing, but can read from envirionment if you want to change it there -- 
// const mongoUrl = 'mongodb://localhost:27017/mongouploads';
// console.log(`\r\n**** In the app.js module - Gridfs db mongoURI url:${mongoUrl}\r\n`);
var whitelist = process.env.WHITELIST;  

// Debug to see what we got from the environment
console.log(`app.js: whitelist:${whitelist} `);

// https://www.stackhawk.com/blog/angular-cors-guide-examples-and-how-to-enable-it/      --- This tells you how to make a proxy
// https://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue
// https://www.section.io/engineering-education/how-to-use-cors-in-nodejs-with-express/
// When you turn cors off but want to whitelist various sites.
// if (whitelist.indexOf(r_origin) > -1)
//     res.setHeader("Access-Control-Allow-Origin", r_origin);
// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect without CORS Issues
    var r_origin = req.headers.origin;

    // Website you wish to allow to connect - Important for a socket connection on the machine this allows everyone
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// Api version in URL 
const VERSION = "/v0.1.0"
const CURTAG_API_URL = "/api"; // + VERSION;

// Backend routes support for this test
app.use(CURTAG_API_URL + '/data', require('./routes/data').router);
app.use(CURTAG_API_URL + '/equipment', require('./routes/equipment').router);
app.use(CURTAG_API_URL + '/dataset', require('./routes/dataset'));
app.use(CURTAG_API_URL + '/dictionary', require('./routes/dataDictionary'));
app.use(CURTAG_API_URL + '/dataset', require('./routes/dataset'));   // Get current data
//app.use(CURTAG_API_URL + '/cur', require('./routes/cur'));
app.use(CURTAG_API_URL + '/users', require('./routes/users'));

app.use('/api', router);  // original default


// When just a slash - create html of message
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// embeded javascript is used for the simple file view
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('public/index.html');
});

// catch 404 not found
app.use((req, res, next) => {
    const path = req.path;
    if (path === '/not-found') {
      res.send('404 Not Found');
    } else {
      next();
    }
  });




module.exports = app;
