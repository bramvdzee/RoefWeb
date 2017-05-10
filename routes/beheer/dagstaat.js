var express = require('express');
var auth = require('../../module/webAuth');
var pdf = require("../../module/pdfGenerator");
var hourCalc = require("../../module/calulateHours");
var router = express.Router();

router.get('/', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  db.query("SELECT d.*, k.naam as klant_naam, "
         + "(SELECT MIN(laadplaats_aankomst) FROM dagstaat_rit WHERE dagstaat_id = d.id) AS dag_begin, "
        + "(SELECT MAX(losplaats_vertrek) FROM dagstaat_rit WHERE dagstaat_id = d.id) AS dag_eind " 
        + "FROM dagstaat AS d "
        + "INNER JOIN klant AS k ON d.klant_id = k.id" ,function(err,rows){

        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        for(var i = 0; i < rows.length; i++)
        {
        
            rows[i].datum = new Date(rows[i].datum).toDateString();
            if(rows[i].dag_begin != null && rows[i].dag_eind != null)
            {
                
                rows[i].dag_begin = hourCalc.trim(rows[i].dag_begin);
                rows[i].dag_eind = hourCalc.trim(rows[i].dag_eind);
            }
        }

        return res.render('overview/dagstaat_list', {data: rows});
    });

});


router.get('/:id', auth.requireLoggedin, function(req, res, next) {

    var db = req.app.locals.connection;

     db.query('SELECT * FROM dagstaat WHERE id=' + req.params.id ,function(err,rows){

        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });
        
        var dagstaat = rows[0];

         db.query('SELECT * FROM dagstaat_rit WHERE dagstaat_id=' + req.params.id ,function(err,rows){
            if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });


            var ritten;
            if(dagstaat) 
                ritten = rows;
            else 
                ritten = [];

            

            db.query('SELECT * FROM klant',function(err,rows){
                if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

                var klanten = rows;

                db.query("SELECT * FROM kenteken", function(err, rows)
                {

                    if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

                    var kentekens = rows;

                        db.query("SELECT * FROM wagentype", function(err, rows)
                        {

                            if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });
                        
                            var wagens = rows;

                            if(dagstaat)
                            {
                                var date = new Date(dagstaat.datum);
                                var monthInt = (parseInt(date.getMonth())+1);
                                var dagInt = (parseInt(date.getDate()));
                                var month = (monthInt < 10 ? "0" + monthInt : monthInt);
                                var dag = (dagInt < 10 ? "0" + dagInt : dagInt);
                                dagstaat.datum = date.getFullYear() + "-" + month + "-" + dag;
                            }
                            

                            return res.render('details/dagstaat_detail', {dagstaat: dagstaat, ritten: ritten, klanten: klanten, kentekens: kentekens, wagens: wagens});

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
    var id = req.params.id;
    var klant_id = req.body.inputKlant;
    var datum = req.body.inputDatum;
    var afgifte = req.body.inputAfgifte;
    var transporteur = req.body.inputTransporteur;
    var kenteken_id = req.body.inputKenteken;
    var wagentype_id = req.body.inputWagen;
    var opmerking = req.body.inputOpmerking;
    var pauze = req.body.inputPauze;
    var naam_uitvoerder = req.body.inputNaamUitvoerder;
    var naam_chauffeur = req.body.inputNaamChauffeur;
    var nacht = req.body.inputNacht;
    var ritten = parseInt(req.body.inputRitten);
    
    var totaal_uren = req.body.inputTotaalUren;

    if(!totaal_uren)
    {

        if(!pauze)
        {
            pauze = "00:00:00";
        }

        var begin = req.body["inputLaadplaatsAankomst_1"];
        var eind = req.body["inputLosplaatsVertrek_" + ritten];

        totaal_uren = hourCalc.getDagTotal(begin, eind, pauze);

    }

    var query;
    
    if(id == 0)
    {
        query = "INSERT INTO dagstaat (klant_id, kenteken_id, wagentype_id, datum, opmerking, afgifte, transporteur, pauze, naam_uitvoerder, naam_chauffeur, nacht, totaal_uren) VALUES ("
            + "" + klant_id + ", "
            + "" + kenteken_id + ", "
            + "" + wagentype_id + ", "
            + "'" + datum + "', "
            + "'" + opmerking + "', "
            + "'" + afgifte + "', "
            + "'" + transporteur + "', "
            + "'" + pauze + "', "
            + "'" + naam_uitvoerder + "', "
            + "'" + naam_chauffeur + "', "
            + "" + nacht + ","
            + "'" + totaal_uren + "');";
    } 
    else
    {
        query = "UPDATE dagstaat SET " 
            + "klant_id = " + klant_id + ", "
            + "kenteken_id = " + kenteken_id + ", "
            + "wagentype_id = " + wagentype_id + ", "
            + "datum = '" + datum + "', "
            + "opmerking = '" + opmerking + "', "
            + "afgifte = '" + afgifte + "', "
            + "transporteur = '" + transporteur + "', "
            + "pauze = '" + pauze + "', "
            + "naam_uitvoerder = '" + naam_uitvoerder + "', "
            + "naam_chauffeur = '" + naam_chauffeur + "', "
            + "nacht = " + nacht + ", "
            + "totaal_uren = '" + totaal_uren + "' "
            + "WHERE id = " + id + ";";
    }

    db.query(query,function(err,rows){
    
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        if(id == 0)
            id = rows.insertId;

        db.query("DELETE FROM dagstaat_rit WHERE dagstaat_id = " + id, function(err, rows)
        {

            if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

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
                        + "'" + rit_hoeveelheid + "')";
            }

            ritQuery += ";";


            db.query(ritQuery, function(err, rows)
            {

                if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });


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
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        return res.redirect("/dagstaat");
    });

});

router.get('/:id/export', auth.requireLoggedin, function(req, res, next) {

    var db = req.app.locals.connection;

  db.query('SELECT d.*, k.naam AS klant_naam, k.woonplaats AS klant_woonplaats, ke.kenteken as kenteken, w.type as wagentype FROM dagstaat AS d ' 
            + 'INNER JOIN klant k ON d.klant_id = k.id ' 
            + 'INNER JOIN kenteken ke ON d.kenteken_id = ke.id '
            + 'INNER JOIN wagentype w ON d.wagentype_id = w.id '
            + 'WHERE d.id = ' + req.params.id,function(err,rows){
        if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

        var dagstaat = rows[0];

        db.query("SELECT * FROM dagstaat_rit WHERE dagstaat_id = " + dagstaat.id, function(err, ritten)
        {

            if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

            dagstaat.ritten = ritten;

            var date = new Date(dagstaat.datum);
            dagstaat.datum = date.getDate() + "/" + (parseInt(date.getMonth()) +1) + "/" + date.getFullYear();

            var dag_begin = dagstaat.ritten[0].laadplaats_aankomst;
            var dag_eind = dagstaat.ritten[dagstaat.ritten.length-1].losplaats_vertrek;

            dagstaat.dag_begin = hourCalc.trim(dag_begin);
            dagstaat.dag_eind = hourCalc.trim(dag_eind);

            pdf.generateDagstaat(res, dagstaat);

        });

        
    });

});

module.exports = router;
