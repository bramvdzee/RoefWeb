var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query('SELECT * FROM rol',function(err,rows){
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        res.send(rows);
    });

});

router.get('/:id', function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query('SELECT * FROM rol WHERE id = ' + req.params.id,function(err,rows){
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        res.send(rows);
    });

});

module.exports = router;
