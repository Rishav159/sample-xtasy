var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/*router.get('/login' , function(req , res , next){
  res.render('login' , { title : 'Login Here'});
});*/
router.get('/dashboard',function(req,res){
  res.render('dashboard',{username : req.session.user.username , title :'Dashboard'});
});

router.get('/logout',function(req,res,next){
  req.session.reset();
  res.redirect('/login');
});
router.get('/modify',function(req,res,next){
  res.render('edit',{title:'Edit User'});
});
router.post('/editpass',function(req,res){
  var db=req.db;
  var collection = db.get('usercollection');
  res.send("Info changed succes !");
});
router.get('/event',function(req,res,next){
  res.render('register',{title : 'Register for events'});
});
router.post('/register',function(req,res){
  var db=req.db;
  var collection = db.get('usercollection');
  res.send(" Updated info !");
});
module.exports = router;
