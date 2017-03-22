var express = require('express');
var auth = require('../module/webAuth');
var router = express.Router();

router.get('/', function(req, res, next) {
  
    var storage = req.app.locals.storage;
    storage.setItem("rolnaam", "");
    storage.setItem("authToken", "");
  
    return res.redirect("/");

});


module.exports = router;
