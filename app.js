var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/sample-xtasy');
var routes = require('./routes/index');
var users = require('./routes/users');
var session = require('client-sessions');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  cookieName : 'session',
  secret : 'Myrandomstring',
  duration : 30*60*1000 ,
  activeDuration : 5*60*1000
}));
function requireLogin(req,res,next){
  console.log("Login has been required !");
  if(!req.user){
    res.redirect('/login');
  }else{
    next();
  }
}
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next){
  req.db=db;
  if(req.session && req.session.user){
    console.log("Cookie found ! Updating !");
    req.user = req.session.user;
    delete req.user.password;
    res.locals.user=req.user;
    next();
  }
  else{
    console.log("Cookie not found ");
    next();
  }
});
app.get('/signup' , function(req , res , next){
  res.render('signup' , {title : 'Sign up here'});
});
app.get('/login' , function(req , res , next){
  res.render('login' , {title : 'Login here'});
});
app.post('/loginuser',function(req,res){
  var db=req.db;
  var collection = db.get('usercollection');
  collection.findOne({'username' : req.body.username},function(e,info){
    if(!info)
      res.send("Invalid username or password !");
    else {
      if(info.password == req.body.password){
        req.session.user = info;
        console.log("Logged in succesfully !");
        res.render('dashboard' ,{username : info.username , title :'Dashboard'});
      }
      else{
        res.send("Invalid username or password !");
      }
    }
  });
});
app.post('/adduser' , function(req,res){
  var db=req.db;
  var info = {
    'username' : req.body.username ,
    'email' : req.body.email ,
    'password' : req.body.password
  };
  var collection = db.get('usercollection');
  collection.insert(info , function(err,doc){
    if(err)
      res.send("There was a problem registering !");
    else {
      res.redirect('/login');
    }
  });
});
app.use('/',requireLogin , function(req,res,next){
  next();
});
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
