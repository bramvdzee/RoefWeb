var express = require('express');
var auth = require('../module/webAuth');
var router = express.Router();

router.get('/', function(req, res, next) {
  
  var msg;
  if(req.query.message)
  {
    if(req.query.message == 1) msg = "Te vaak geprobeerd opnieuw in te loggen, probeer het over 10 minuten nogmaals.";
    if(req.query.message == 2) msg = "U heeft een verkeerde gebruikersnaam of wachtwoord ingevuld.";
    if(req.query.message == 3) msg = "U heeft een verkeerde gebruikersnaam of wachtwoord ingevuld."
  }
  
  res.render('login', {layout:false,message: msg});

});

router.post('/', function(req, res, next)
{
    var name = req.body.inputName;
    var password = req.body.inputPassword;
    auth.login(req, res, name, password);    

});

module.exports = router;
