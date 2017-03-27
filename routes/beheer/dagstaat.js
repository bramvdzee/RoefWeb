var express = require('express');
var auth = require('../../module/webAuth');
var pdf = require("../../module/pdfGenerator");
var router = express.Router();

router.get('/', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  db.query('SELECT * FROM dagstaat',function(err,rows){
        if(err) throw err;

        return res.render('overview/dagstaat_list', {data: rows});
    });

});


router.get('/:id', auth.requireLoggedin, function(req, res, next) {

    var db = req.app.locals.connection;

     db.query('SELECT * FROM dagstaat WHERE id=' + req.params.id ,function(err,rows){

        if(err) throw err;
        var dagstaat = rows[0];

         db.query('SELECT * FROM dagstaat_rit WHERE dagstaat_id=' + req.params.id ,function(err,rows){
            if(err) throw err;

            dagstaat.ritten = rows;

            db.query('SELECT * FROM klant',function(err,rows){
                if(err) throw err;

                var klanten = rows;

                db.query("SELECT * FROM kenteken", function(err, rows)
                {

                    if(err) throw err;

                    var kentekens = rows;

                        db.query("SELECT * FROM wagentype", function(err, rows)
                        {

                            if(err) throw err;
                        
                            var wagens = rows;

                            var date = new Date(dagstaat.datum);
                            var monthInt = (parseInt(date.getMonth())+1);
                            var month = (monthInt < 10 ? "0" + monthInt : monthInt);
                            dagstaat.datum = date.getFullYear() + "-" + month + "-" + date.getDate();

                            return res.render('details/dagstaat_detail', {dagstaat: dagstaat, klanten: klanten, kentekens: kentekens, wagens: wagens});

                        });

                });

                
            });            

        });
        

    });

});

router.post("/:id", auth.requireLoggedin, function(req, res, next)
{

    var db = req.app.locals.connection;

    //dagstaat
    var id = req.body.inputId;
    var klant_id = req.body.inputKlant;
    var woonplaats = req.body.inputWoonplaats;
    var datum = req.body.inputDatum;
    var afgifte = req.body.inputAfgifte;
    var transporteur = req.body.inputTransporteur;
    var kenteken_id = req.body.inputKenteken;
    var wagentype_id = req.body.inputWagen;
    var opmerking = req.body.inputOpmerking;
    var naam_uitvoerder = req.body.inputNaamUitvoerder;
    var naam_chauffeur = req.body.inputNaamChauffeur;

    var query = "UPDATE dagstaat SET " 
            + "klant_id = " + klant_id + ", "
            + "kenteken_id = " + kenteken_id + ", "
            + "wagentype_id = " + wagentype_id + ", "
            + "woonplaats = '" + woonplaats+ "', "
            + "datum = '" + datum + "', "
            + "opmerking = '" + opmerking + "', "
            + "afgifte = '" + afgifte + "', "
            + "transporteur = '" + transporteur + "', "
            + "naam_uitvoerder = '" + naam_uitvoerder + "', "
            + "naam_chauffeur = '" + naam_chauffeur + "' "
            + "WHERE id = " + id + ";";

    var ritten = parseInt(req.body.inputRitten);
    var ritQuery = "INSERT INTO dagstaat_rit (id, dagstaat_id, opdrachtgever, laadplaats, laadplaats_aankomst, laadplaats_vertrek, losplaats, losplaats_aankomst, losplaats_vertrek, lading, hoeveelheid) VALUES ";

    for(var i = 0; i < ritten; i++)
    {
        var rit_id = i+1;
        var rit_opdrachtgever = req.body["inputOpdrachtgever_" + rit_id];
        var rit_laadplaats = req.body["inputLaadplaats_" + rit_id];
        var rit_laadplaats_aankomst = req.body["inputLaadplaatsAankomst_" + rit_id];
        var rit_laadplaats_vertrek = req.body["inputLaadplaatsVertrek_" + rit_id];
        var rit_losplaats = req.body["inputLosplaats_" + rit_id];
        var rit_losplaats_aankomst = req.body["inputLosplaatsAankomst_" + rit_id];
        var rit_losplaats_vertrek = req.body["inputLosplaatsVertrek_" + rit_id];
        var rit_lading = req.body["inputLading_" + rit_id];
        var rit_hoeveelheid = req.body["inputHoeveelheid_" + rit_id];

        if(rit_id > 1)
            ritQuery += ", ";

        ritQuery += "("
                + "" + rit_id + ", "
                + "" + id + ", "
                + "'" + rit_opdrachtgever + "', "
                + "'" + rit_laadplaats + "', "
                + "'" + rit_laadplaats_aankomst + "', "
                + "'" + rit_laadplaats_vertrek + "', "
                + "'" + rit_losplaats + "', "
                + "'" + rit_losplaats_aankomst + "', "
                + "'" + rit_losplaats_vertrek + "', "
                + "'" + rit_lading + "', "
                + "" + rit_hoeveelheid + ")";
    }

    ritQuery += ";";

    db.query(query,function(err,rows){
    
        if(err) throw err;

        db.query("DELETE FROM dagstaat_rit WHERE dagstaat_id = " + id, function(err, rows)
        {

            if(err) throw err;


            db.query(ritQuery, function(err, rows)
            {

                if(err) throw err;


                return res.redirect("/dagstaat");

            });


        });
    });

});

router.get('/:id/delete', auth.requireLoggedin, function(req, res, next)
{
    var db = req.app.locals.connection;

    db.query("DELETE FROM dagstaat WHERE id = " + req.params.id, function(err, rows)
    {
        if(err) throw err;

        return res.redirect("/dagstaat");
    });

});

router.get('/:id/export', auth.requireLoggedin, function(req, res, next) {

    var db = req.app.locals.connection;

  db.query('SELECT d.*, k.naam AS klant_naam, ke.kenteken as kenteken, w.type as wagentype FROM dagstaat AS d ' 
            + 'INNER JOIN klant k ON d.klant_id = k.id ' 
            + 'INNER JOIN kenteken ke ON d.kenteken_id = ke.id '
            + 'INNER JOIN wagentype w ON d.wagentype_id = w.id '
            + 'WHERE d.id = ' + req.params.id,function(err,rows){
        if(err) throw err;

        var dagstaat = rows[0];

        db.query("SELECT * FROM dagstaat_rit WHERE dagstaat_id = " + dagstaat.id, function(err, ritten)
        {

            if(err) throw err;

            dagstaat.ritten = ritten;

            var date = new Date(dagstaat.datum);
            dagstaat.datum = date.getDate() + "/" + (parseInt(date.getMonth()) +1) + "/" + date.getFullYear();

            var dag_begin = dagstaat.ritten[0].laadplaats_aankomst;
            var dag_eind = dagstaat.ritten[dagstaat.ritten.length-1].losplaats_vertrek;

            var time1 = new Date("01/01/2017 " + dag_begin.substr(0,5));   
            var time2 = new Date("01/01/2017 " + dag_eind.substr(0,5));

            if(time2 < time1)
                time2 = new Date("02/01/2017 " + dag_eind);


            var difference = new Date(time2.getTime() - time1.getTime());

            var hours = difference.getHours() - parseInt(dagstaat.pauze);
            var minutes = difference.getMinutes();
            var total = (hours > 10 ? hours : "0" + hours) + ":" + (minutes > 10 ? minutes : "0" + minutes);

            dagstaat.dag_totaal = total;
            dagstaat.dag_begin = dag_begin.substr(0,5);
            dagstaat.dag_eind = dag_eind.substr(0,5);

            pdf.generateDagstaat(req, res, dagstaat);

        });

        
    });

});

module.exports = router;
