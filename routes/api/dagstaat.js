var express = require('express');
var auth = require('../../module/auth');
var config = require('../../config/config');
var hourCalc = require("../../module/calulateHours");
var router = express.Router();

router.get('/', auth.requireLoggedIn, auth.requireRole("Beheerder"), function(req, res, next) {
  
    var db = req.app.locals.connection;

    db.query("SELECT d.*, k.naam as klant_naam "
        + "FROM dagstaat AS d "
        + "INNER JOIN klant AS k ON d.klant_id = k.id ORDER BY d.id DESC" ,function(err,rows){
        
        if(err) throw err;

        for(var i = 0; i < rows.length; i++)
        {
        
            //rows[i].datum = new Date(rows[i].datum).toDateString();

            if(rows[i].dag_begin && rows[i].dag_eind)
            {
                rows[i].dag_begin = hourCalc.trim(rows[i].dag_begin);
                rows[i].dag_eind = hourCalc.trim(rows[i].dag_eind);
                rows[i].dag_totaal = hourCalc.getDagTotal(rows[i].dag_begin, rows[i].dag_eind, rows[i].pauze);
            }
            else
            {
                rows[i].dag_totaal = "00:00";
            }
        }

        res.json(rows);
    });

});

router.post('/', auth.requireLoggedIn, function(req, res, next) {
  
    var db = req.app.locals.connection;

    var klant_id = req.body.klant_id;
    var kenteken_id = req.body.kenteken_id;
    var wagentype_id = req.body.wagentype_id;
    var datum = req.body.datum.slice(0,10).replace("-", "/");
    var opmerking = (req.body.opmerking ? config.escape(req.body.opmerking) : "");
    var afgifte = (req.body.afgifte ? config.escape(req.body.afgifte) : "");
    var transporteur = config.escape(req.body.transporteur);
    var pauze = req.body.pauze;
    var naam_uitvoerder = config.escape(req.body.naam_uitvoerder);
    var naam_chauffeur = config.escape(req.body.naam_chauffeur);
    var totaal_uren = req.body.totaal_uren;
    var nacht = req.body.nacht;
    var handtekening = req.body.handtekening;

    if(!totaal_uren)
    {

        if(!pauze)
        {
            pauze = "00:00:00";
        }
        var begin = toTimeStamp(req.body.ritten[0].laadplaats_aankomst);
        var eind = toTimeStamp(req.body.ritten[req.body.ritten.length-1].losplaats_vertrek);

        totaal_uren = hourCalc.getDagTotal(begin, eind, pauze);

    }

    var query = "INSERT INTO dagstaat (klant_id, kenteken_id, wagentype_id, datum, opmerking, afgifte, transporteur, pauze, naam_uitvoerder, naam_chauffeur, nacht, handtekening, totaal_uren) VALUES ("
    + "" + klant_id + ","
    + "" + kenteken_id + ","
    + "" + wagentype_id + ","
    + "'" + datum + "',"
    + "'" + opmerking + "',"
    + "'" + afgifte + "',"
    + "'" + transporteur + "',"
    + "'" + pauze + "', "
    + "'" + naam_uitvoerder + "',"
    + "'" + naam_chauffeur + "',"
    + "" + nacht + "," 
    + "'" + handtekening + "',"
    + "'" + totaal_uren + "')";

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
            + "'" + rit.hoeveelheid + "')";

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
  
    var db = req.app.locals.connection;

    var klant_id = req.body.klant_id;
    var kenteken_id = req.body.kenteken_id;
    var wagentype_id = req.body.wagentype_id;
    var datum = req.body.datum.slice(0,10).replace("-", "/");
    var opmerking = (req.body.opmerking ? config.escape(req.body.opmerking) : "");
    var afgifte = (req.body.afgifte ? config.escape(req.body.afgifte) : "");
    var transporteur = config.escape(req.body.transporteur);
    var pauze = req.body.pauze;
    var naam_uitvoerder = config.escape(req.body.naam_uitvoerder);
    var naam_chauffeur = config.escape(req.body.naam_chauffeur);
    var nacht = req.body.nacht;
    var handtekening = req.body.handtekening;
    var totaal_uren = req.body.totaal_uren;

    if(!totaal_uren)
    {

        if(!pauze)
        {
            pauze = "00:00:00";
        }
        var begin = toTimeStamp(req.body.ritten[0].laadplaats_aankomst);
        var eind = toTimeStamp(req.body.ritten[req.body.ritten.length-1].losplaats_vertrek);

        totaal_uren = hourCalc.getDagTotal(begin, eind, pauze);

    }

    var query = "UPDATE dagstaat SET "
    + "klant_id = " + klant_id + ","
    + "kenteken_id = " + kenteken_id + ","
    + "wagentype_id = " + wagentype_id + ","
    + "datum = '" + datum + "',"
    + "opmerking = '" + opmerking + "',"
    + "afgifte = '" + afgifte + "',"
    + "transporteur = '" + transporteur + "',"
    + "pauze = '" + pauze + "', "
    + "naam_uitvoerder = '" + naam_uitvoerder + "',"
    + "naam_chauffeur = '" + naam_chauffeur + "',"
    + "nacht = " + nacht + ", "
    + "handtekening = '" + handtekening + "', "
    + "totaal_uren = '" + totaal_uren + "'"
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

                var rit = req.body.ritten[i];
                var opdrachtgever = rit.opdrachtgever;
                var laadplaats = rit.laadplaats;
                var losplaats = rit.losplaats;
                var lading = rit.lading;

                query1 += "(" + rit.id + ","
                + "" + req.params.id + ","
                + "'" + opdrachtgever + "',"
                + "'" + laadplaats + "',"
                + "'" + toTimeStamp(rit.laadplaats_aankomst) + "',"
                + "'" + toTimeStamp(rit.laadplaats_vertrek) + "',"
                + "'" + losplaats + "',"
                + "'" + toTimeStamp(rit.losplaats_aankomst) + "',"
                + "'" + toTimeStamp(rit.losplaats_vertrek) + "',"
                + "'" + lading + "',"
                + "'" + rit.hoeveelheid + "')";

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

    if(isNaN(Date.parse(date)))
        return date.substr(0,5);

    date = new Date(date);
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

}

module.exports = router;
