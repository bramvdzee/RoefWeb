var express = require('express');
var auth = require('../../module/auth');
var config = require('../../config/config');
var router = express.Router();

router.get('/', auth.requireLoggedIn, auth.requireRole("Beheerder"), function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query('SELECT * FROM dagstaat',function(err,rows){
        if(err) throw err;

        res.json(rows);
    });

});

router.post('/', auth.requireLoggedIn, auth.requireRole("Beheerder"), function(req, res, next) {
  
    var db = req.app.locals.connection;

    var klant_id = req.body.klant_id;
    var kenteken_id = req.body.kenteken_id;
    var wagentype_id = req.body.wagentype_id;
    var woonplaats = config.escape(req.body.woonplaats);
    var datum = req.body.datum.slice(0,10).replace("-", "/");
    var opmerking = (req.body.opmerking ? config.escape(req.body.opmerking) : "");
    var afgifte = config.escape(req.body.afgifte);
    var transporteur = config.escape(req.body.transporteur);
    var pauze = req.body.pauze;
    var naam_uitvoerder = config.escape(req.body.naam_uitvoerder);
    var naam_chauffeur = config.escape(req.body.naam_chauffeur);

    var query = "INSERT INTO dagstaat (klant_id, kenteken_id, wagentype_id, woonplaats, datum, opmerking, afgifte, transporteur, pauze, naam_uitvoerder, naam_chauffeur) VALUES ("
    + "" + klant_id + ","
    + "" + kenteken_id + ","
    + "" + wagentype_id + ","
    + "'" + woonplaats + "',"
    + "'" + datum + "',"
    + "'" + opmerking + "',"
    + "'" + afgifte + "',"
    + "'" + transporteur + "',"
    + "" + pauze + ", "
    + "'" + naam_uitvoerder + "',"
    + "'" + naam_chauffeur + "')";

    db.query(query, function(err, rows)
    {
        if(err) throw err;

        var id = rows.insertId;

        var query1 = "INSERT INTO dagstaat_rit (id, dagstaat_id, opdrachtgever, laadplaats, laadplaats_aankomst, laadplaats_vertrek, losplaats, losplaats_aankomst, losplaats_vertrek, lading, hoeveelheid) VALUES ";

        for(var i = 0; i < req.body.ritten.length; i++)
        {

            var rit = req.body.ritten[i];

            var opdrachtgever = config.escape(rit.opdrachtgever);
            var laadplaats = config.escape(rit.laadplaats);
            var losplaats = config.escape(rit.losplaats);
            var lading = config.escape(rit.lading);
            
            query1 += "(" + rit.id + ","
            + "" + id + ","
            + "'" + opdrachtgever + "',"
            + "'" + laadplaats + "',"
            + "'" + toTimeStamp(rit.laadplaats_aankomst) + "',"
            + "'" + toTimeStamp(rit.laadplaats_vertrek) + "',"
            + "'" + losplaats + "',"
            + "'" + toTimeStamp(rit.losplaats_aankomst) + "',"
            + "'" + toTimeStamp(rit.losplaats_vertrek) + "',"
            + "'" + lading + "',"
            + "" + rit.hoeveelheid + ")";

            if(i != req.body.ritten.length-1)
            {
                query1 += ",";
            }

        }

        db.query(query1, function(err, rows)
        {
            if(err) throw err;

            res.json({message: "OK"});
        });

    });

});

router.put('/:id', auth.requireLoggedIn, auth.requireRole("Beheerder"), function(req, res, next) {
  
    console.log(req.body);

    var db = req.app.locals.connection;

    var klant_id = req.body.klant_id;
    var kenteken_id = req.body.kenteken_id;
    var wagentype_id = req.body.wagentype_id;
    var woonplaats = config.escape(req.body.woonplaats);
    var datum = req.body.datum.slice(0,10).replace("-", "/");
    var opmerking = (req.body.opmerking ? config.escape(req.body.opmerking) : "");
    var afgifte = config.escape(req.body.afgifte);
    var transporteur = config.escape(req.body.transporteur);
    var pauze = req.body.pauze;
    var naam_uitvoerder = config.escape(req.body.naam_uitvoerder);
    var naam_chauffeur = config.escape(req.body.naam_chauffeur);

    var query = "UPDATE dagstaat SET "
    + "klant_id = " + klant_id + ","
    + "kenteken_id = " + kenteken_id + ","
    + "wagentype_id = " + wagentype_id + ","
    + "woonplaats = '" + woonplaats + "',"
    + "datum = '" + datum + "',"
    + "opmerking = '" + opmerking + "',"
    + "afgifte = '" + afgifte + "',"
    + "transporteur = '" + transporteur + "',"
    + "pauze = " + pauze + ", "
    + "naam_uitvoerder = '" + naam_uitvoerder + "',"
    + "naam_chauffeur = '" + naam_chauffeur + "'"
    + "WHERE id = " + req.params.id;

    db.query(query, function(err, rows)
    {
        if(err) throw err;

        db.query("DELETE FROM dagstaat_rit WHERE dagstaat_id = " + req.params.id, function(err, result)
        {

            if(err) throw err;

            var query1 = "INSERT INTO dagstaat_rit (id, dagstaat_id, opdrachtgever, laadplaats, laadplaats_aankomst, laadplaats_vertrek, losplaats, losplaats_aankomst, losplaats_vertrek, lading, hoeveelheid) VALUES ";

            for(var i = 0; i < req.body.ritten.length; i++)
            {

                console.log(rit);
                var rit = req.body.ritten[i];
                var opdrachtgever = rit.opdrachtgever;
                var laadplaats = rit.laadplaats;
                var losplaats = rit.losplaats;
                var lading = rit.lading;

                query1 += "(" + rit.id + ","
                + "" + req.params.id + ","
                + "'" + opdrachtgever + "',"
                + "'" + laadplaats + "',"
                + "'" + rit.laadplaats_aankomst + "',"
                + "'" + rit.laadplaats_vertrek + "',"
                + "'" + losplaats + "',"
                + "'" + rit.losplaats_aankomst + "',"
                + "'" + rit.losplaats_vertrek + "',"
                + "'" + lading + "',"
                + "" + rit.hoeveelheid + ")";

                if(i != req.body.ritten.length-1)
                {
                    query1 += ",";
                }

            }

            db.query(query1, function(err, rows)
            {
                if(err) throw err;

                res.json({message: "OK"});
            });

        });

        

    });

});

router.get('/:id', auth.requireLoggedIn, auth.requireRole("Beheerder"), function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query('SELECT * FROM dagstaat WHERE id = ' + req.params.id,function(err,rows){
        if(err) throw err;

        var dagstaat = rows[0];

        db.query("SELECT * FROM dagstaat_rit WHERE dagstaat_id = " + dagstaat.id, function(err, ritten)
        {

            if(err) throw err;

            dagstaat.ritten = ritten;
            res.json(dagstaat);

        });

        
    });

});

router.delete('/:id', auth.requireLoggedIn, auth.requireRole("Beheerder"), function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query('DELETE FROM dagstaat WHERE id = ' + req.params.id,function(err,rows){
        if(err) throw err;

        res.json({message: "OK"});
    });

});

function toTimeStamp(date)
{

    date = new Date(date);
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

}

module.exports = router;
