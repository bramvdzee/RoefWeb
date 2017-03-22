var express = require('express');
var auth = require('../../module/webAuth');
var pdf = require("../../module/pdfGenerator");
var moment = require("moment");
var router = express.Router();

router.get('/', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  db.query('SELECT * FROM dagstaat',function(err,rows){
        if(err) throw err;

        return res.render('dagstaat_list', {data: rows});
    });

});


router.get('/:id', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;
  res.render('index');

});

router.get('/:id/export', auth.requireLoggedin, function(req, res, next) {

    pdf.generateDagstaat(req, res, req.params.id);

});

router.get('/:id/pdf', auth.requireLoggedin, function(req, res, next) {

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

            var hours = difference.getHours() - 1; //??
            var minutes = difference.getMinutes();
            var total = (hours > 10 ? hours : "0" + hours) + ":" + (minutes > 10 ? minutes : "0" + minutes);

            dagstaat.dag_total = total;
            dagstaat.dag_begin = dag_begin.substr(0,5);
            dagstaat.dag_eind = dag_eind.substr(0,5);

            res.render('dagstaat_pdf', {layout: false, data: dagstaat});

        });

        
    });

});

module.exports = router;
