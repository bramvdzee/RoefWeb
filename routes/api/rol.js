var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query('SELECT * FROM rol',function(err,rows){
        if(err) throw err;

        res.send(rows);
    });

});

router.get('/:id', function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query('SELECT * FROM rol WHERE id = ' + req.params.id,function(err,rows){
        if(err) throw err;

        res.send(rows);
    });

});

module.exports = router;
