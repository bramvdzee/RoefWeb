var express = require('express');
var auth = require('../../module/auth');
var config = require('../../config/config');
var router = express.Router();

router.get('/', auth.requireLoggedIn, function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query('SELECT * FROM klant',function(err,rows){
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        res.send(rows);
    });

});

router.post('/', auth.requireLoggedIn, auth.requireRole("Beheerder"), function(req, res, next) {
  
    var db = req.app.locals.connection;
    
    db.query("INSERT INTO klant (naam, woonplaats) VALUES ('" + config.escape(req.body.naam) + "', '" + config.escape(req.body.woonplaats) +"')", function(err, rows)
    {
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        res.json({message: "OK"});
    });    

});

router.put('/:id', auth.requireLoggedIn, auth.requireRole("Beheerder"), function(req, res, next) {
  
    var db = req.app.locals.connection;
    
    db.query("UPDATE klant SET naam = '" + config.escape(req.body.naam) + "', woonplaats='" + config.escape(req.body.woonplaats) + "' WHERE id = " + req.body.id, function(err, rows)
    {
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        res.json({message: "OK"});
    });    

});

router.get('/:id', auth.requireLoggedIn, auth.requireRole("Beheerder"), function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query('SELECT * FROM klant WHERE id = ' + req.params.id,function(err,rows){
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        res.send(rows[0]);
    });

});

router.delete('/:id', auth.requireLoggedIn, auth.requireRole("Beheerder"), function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query('DELETE FROM klant WHERE id = ' + req.params.id,function(err,rows){
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        res.json({message: "OK"});
    });

});

module.exports = router;
