'use strict';

//set configs
import config from './config.js';
global.Config = new config();

import path from 'path';
import express from 'express';
import signInRoutes from './routes/sign-in-routes.js';
import signOutRoutes from './routes/sign-out-routes.js';
import signUpRoutes from './routes/sign-up-routes.js';
import userRoutes from './routes/user-routes.js';
import passport from './middleware/passport.js';
import helmet from 'helmet';
import express_enforces_ssl from 'express-enforces-ssl';

var server = express();

// ======== *** VIEWS AND TEMPLATES ***

//Set port
server.set('port', (process.env.PORT || 5000));
server.set('views', path.join(__dirname, 'templates'));
server.set('view engine', 'jade');

//Setup location to static assets
server.use(express.static(path.join(__dirname)));


// ======== *** SECURITY MIDDLEWARE ***

//setup helmet js
server.use(helmet());

//setting CSP
var scriptSources = ["'self'", "'unsafe-inline'", "'unsafe-eval'", "ajax.googleapis.com", "www.google-analytics.com"];
var styleSources = ["'self'", "'unsafe-inline'", "ajax.googleapis.com"];
var connectSources = ["'self'"];
server.use(helmet.contentSecurityPolicy({
    defaultSrc: ["'self'"],
    scriptSrc: scriptSources,
    styleSrc: styleSources,
    connectSrc: connectSources,
    reportOnly: false,
    setAllHeaders: false,
    safari5: false
}));

//enforcing SSL for production environments
if(process.env.NODE_ENV == 'production'){
  server.use(express_enforces_ssl());
}

//passport setup
server.use(passport.initialize());
server.use(passport.session());

// ========= *** ROUTES ***
server.use('/auth', signInRoutes);
server.use('/auth', signOutRoutes);
server.use('/auth', signUpRoutes);
server.use('/api/v1', userRoutes);


// ========= *** SERVER LOAD ***

//Initial SPA load
server.get('/*', function (req, res) {
  res.render('index');
});

//Run up the server
server.listen(server.get('port'), function() {
  if (process.send) {
    process.send('online');
  } else {
    console.log('The server is running at http://localhost:' + server.get('port'));
  }
});
