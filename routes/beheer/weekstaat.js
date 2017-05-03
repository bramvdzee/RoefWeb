var express = require('express');
var auth = require('../../module/webAuth');
var pdf = require("../../module/pdfGenerator");
var hourCalc = require('../../module/calulateHours');
var router = express.Router();

router.get('/', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  var status = req.query.status;

  db.query("SELECT * FROM klant", function(err, rows)
  {
    if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });
    return res.render('weekstaat', {klanten: rows, status: status});
  });

  

});

router.post('/', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  var date = req.body.inputWeek.split("-");
  var week = date[1].substr(1);
  var jaar = date[0];


  var simple = new Date(jaar, 0, 1 + (week - 1) * 7);
  var dow = simple.getDay();
  var beginDate = simple;
  if (dow <= 4)
      beginDate.setDate(simple.getDate() - simple.getDay() + 1);
  else
      beginDate.setDate(simple.getDate() + 8 - simple.getDay());

  var endDate = new Date(beginDate);
  endDate.setDate(endDate.getDate()+6);

  var datum_begin = beginDate.getFullYear() + "/" + (parseInt(beginDate.getMonth()) + 1) + "/" + beginDate.getDate();
  var datum_eind = endDate.getFullYear() + "/" + (parseInt(endDate.getMonth()) + 1) + "/" + endDate.getDate();

  db.query("SELECT d.*, w.type as wagentype, k.naam AS klant_naam, "
        + "(SELECT MIN(laadplaats_aankomst) FROM dagstaat_rit WHERE dagstaat_id = d.id) AS dag_begin, "
        + "(SELECT MAX(losplaats_vertrek) FROM dagstaat_rit WHERE dagstaat_id = d.id) AS dag_eind"
        + " FROM dagstaat as d INNER JOIN wagentype as w ON d.wagentype_id = w.id INNER JOIN klant as k ON d.klant_id = k.id WHERE d.klant_id = " + req.body.inputKlant + " AND d.datum >= '" + datum_begin + "' AND d.datum <= '" + datum_eind + "' ORDER BY d.datum ASC", function(err, rows)
  {
    if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });
  
    if(rows.length == 0)
      return res.redirect('/weekstaat?status=Er zijn geen dagstaten voor deze week!');
    else
    {

      var dagstaten = rows;

      dagstaten.forEach(function(dagstaat)
      {
        if(dagstaat.dag_begin && dagstaat.dag_eind)
          {
            dagstaat.dag_totaal = hourCalc.getDagTotal(dagstaat.dag_begin, dagstaat.dag_eind, dagstaat.pauze);
          }
          else
          {
            dagstaat.dag_totaal = "00:00";
          }
      });
      
      pdf.generateWeekstaat(res, week, jaar, dagstaten);

    }

  });

});

module.exports = router;
