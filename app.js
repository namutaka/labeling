var express = require('express'),
  params = require('express-params'),
  http = require('http'),
  path = require('path'),
  routes = require('./routes'),
  app = express();

params.extend(app);

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express["static"](path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});


routes(app);

http.createServer(app).listen(app.get('port'), function() {
  return console.log("Express server listening on port " + app.get('port'));
});


