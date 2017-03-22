var express = require('express');
var auth = require('../module/webAuth');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('login', {layout: false});
});

router.post('/', function(req, res, next)
{
  
    console.log(req.body);

});

module.exports = router;
