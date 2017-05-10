var express = require('express');
var auth = require('../../module/webAuth');
var router = express.Router();

router.get('/', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  db.query('SELECT * FROM kenteken',function(err,rows){
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        return res.render('overview/kenteken_list', {data: rows});
    });

});

router.get('/:id', auth.requireLoggedin, function(req, res, next) {

    var db = req.app.locals.connection;
    
    db.query('SELECT * FROM kenteken WHERE id = ' + req.params.id ,function(err,rows){
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        var newkenteken = (rows.length == 0);

        return res.render('details/kenteken_detail', {kenteken: rows[0]});
    });

});

router.post('/:id', auth.requireLoggedin, function(req, res, next) {

    var db = req.app.locals.connection;
    
    if(req.params.id == 0)
    {
        db.query("INSERT INTO kenteken (kenteken) VALUES ('" + req.body.inputKenteken + "')" ,function(err,rows){
            if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

            return res.redirect('/kenteken');
        });
    }
    else
    {
        db.query("UPDATE kenteken SET kenteken = '" + req.body.inputKenteken + "' WHERE id = "+ req.params.id ,function(err,rows){
            if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

            return res.redirect('/kenteken');
        });
    }
    

});

router.get('/:id/delete', auth.requireLoggedin, function(req, res, next) {

     var db = req.app.locals.connection;

     db.query("DELETE FROM kenteken WHERE id = "+ req.params.id ,function(err,rows){
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        return res.redirect('/kenteken');
    });

});

module.exports = router;