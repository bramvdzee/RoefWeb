var express = require('express');
var auth = require('../module/webAuth');
var router = express.Router();

/* GET home page. */
router.get('/', auth.requireLoggedin, function(req, res, next) {

  var storage = req.app.locals.storage;

  if(storage.getItem("rolnaam") == null || storage.getItem("rolnaam") != "Beheerder")
    return res.status(500);

  res.render('index');
  
});

module.exports = router;
