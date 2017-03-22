var express = require('express');
var auth = require('../module/webAuth');
var router = express.Router();

/* GET home page. */
router.get('/', auth.requireLoggedin, function(req, res, next) {

  var storage = req.app.locals.storage;

  if(storage.getItem("rolnaam") == null || storage.getItem("rolnaam") != "Beheerder")
  {
    storage.setItem("authToken", "");
    return res.redirect("login");
  }

  res.render('index');

});

module.exports = router;
