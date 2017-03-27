var express = require('express');
var auth = require('../../module/webAuth');
var router = express.Router();

router.get('/', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  db.query('SELECT * FROM klant',function(err,rows){
        if(err) throw err;

        return res.render('overview/klant_list', {data: rows});
    });

});

router.get('/:id', auth.requireLoggedin, function(req, res, next) {

    var db = req.app.locals.connection;
    
    db.query('SELECT * FROM klant WHERE id = ' + req.params.id ,function(err,rows){
        if(err) throw err;

        var newKlant = (rows.length == 0);

        return res.render('details/klant_detail', {klant: rows[0]});
    });

});

router.post('/:id', auth.requireLoggedin, function(req, res, next) {

    var db = req.app.locals.connection;
    
    if(req.params.id == 0)
    {
        db.query("INSERT INTO klant (naam) VALUES ('" + req.body.inputNaam + "')" ,function(err,rows){
            if(err) throw err;

            return res.redirect('/klant');
        });
    }
    else
    {
        db.query("UPDATE klant SET naam = '" + req.body.inputNaam + "' WHERE id = "+ req.params.id ,function(err,rows){
            if(err) throw err;

            return res.redirect('/klant');
        });
    }
    

});

router.get('/:id/delete', auth.requireLoggedin, function(req, res, next) {

     var db = req.app.locals.connection;

     db.query("DELETE FROM klant WHERE id = "+ req.params.id ,function(err,rows){
        if(err) throw err;

        return res.redirect('/klant');
    });

});

module.exports = router;