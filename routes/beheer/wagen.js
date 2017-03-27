var express = require('express');
var auth = require('../../module/webAuth');
var router = express.Router();

router.get('/', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  db.query('SELECT * FROM wagentype',function(err,rows){
        if(err) throw err;

        return res.render('overview/wagen_list', {data: rows});
    });

});

router.get('/:id', auth.requireLoggedin, function(req, res, next) {

    var db = req.app.locals.connection;
    
    db.query('SELECT * FROM wagentype WHERE id = ' + req.params.id ,function(err,rows){
        if(err) throw err;

        return res.render('details/wagen_detail', {wagen: rows[0]});
    });

});

router.post('/:id', auth.requireLoggedin, function(req, res, next) {

    var db = req.app.locals.connection;
    
    if(req.params.id == 0)
    {
        db.query("INSERT INTO wagentype (type) VALUES ('" + req.body.inputType + "')" ,function(err,rows){
            if(err) throw err;

            return res.redirect('/wagen');
        });
    }
    else
    {
        db.query("UPDATE wagentype SET type = '" + req.body.inputType + "' WHERE id = "+ req.params.id ,function(err,rows){
            if(err) throw err;

            return res.redirect('/wagen');
        });
    }
    

});

router.get('/:id/delete', auth.requireLoggedin, function(req, res, next) {

     var db = req.app.locals.connection;

     db.query("DELETE FROM wagentype WHERE id = "+ req.params.id ,function(err,rows){
        if(err) throw err;

        return res.redirect('/wagen');
    });

});

module.exports = router;