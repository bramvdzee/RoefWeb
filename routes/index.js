var express = require('express');
var auth = require('../module/webAuth');
var router = express.Router();

/* GET home page. */
router.get('/', auth.requireLoggedin, function(req, res, next) {
  res.render('index');
});

module.exports = router;
