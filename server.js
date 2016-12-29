'use strict';

var express  = require('express');
var request = require('request');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var morgan = require('morgan'); // log requests to the console (express4)
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var session  = require('express-session');
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var favicon = require('serve-favicon');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');

var app = express(); // create our app w/ express

// Define the strategy to be used by PassportJS
passport.use(new LocalStrategy (
    function(email, password, done) {
        request.post(
            {
                uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/user/info",
                json: { email : email }
            },
            function(err, result) {
                if (err) return done(err);

                //could not find user
                if (!result.body) {
                    return done(null, false, { message: 'Incorrect username.' });
                }

                //compare password
                bcrypt.compare(password, result.body.user.properties.password, function(err, isMatch) {
                    if (err) return done(err);

                    //incorrect password
                    if (!isMatch) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }

                    //credentials correct
                    return done(null, result.body);
                });

            }
        );
    }
));

// Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
    if (!req.isAuthenticated()){
        res.sendStatus(401);
    } else {
        next();
    }
};

// configuration
app.use(express.static(path.join(__dirname, 'app'))); // set the static files location /app
app.use('/node_modules',  express.static(path.join(__dirname, 'node_modules'))); //redirect requests to node_modules folder
app.use('/images',  express.static(path.join(__dirname, 'app', 'images'))); //redirect requests to images folder
app.use('/fonts',  express.static(path.join(__dirname, 'app', 'fonts'))); //redirect requests to fonts folder
app.use(favicon(path.join(__dirname,'app','images', 'favicon-stethoscope.ico'))); //provide favicon path
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(session({ secret: 'secret', cookie: { maxAge: 3600000 }, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// api
require('./routes/dataset')(app,auth,request);
require('./routes/disorder')(app,auth,request);
require('./routes/event')(app,auth,request);
require('./routes/feature')(app,auth,request);
require('./routes/panel')(app,auth,request);
require('./routes/report')(app,auth,request);
require('./routes/sample')(app,auth,request);
require('./routes/symbol')(app,auth,request);
require('./routes/user')(app,auth,request,bcrypt);
require('./routes/variant')(app,auth,request);
require('./routes/workflow')(app,auth,request);

// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});

// route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
});

// route to log out
app.post('/logout', function(req, res){
    req.logOut();
    res.sendStatus(200);
});

// load the single view file (angular will handle the page changes on the front-end)
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

// listen (start app with node server.js)
//TODO add mode ie. production/dev
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));
console.log("App listening on port " + app.get('port'));