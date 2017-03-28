var express = require('express');
var auth = require('../../module/webAuth');
var pdf = require("../../module/pdfGenerator");
var router = express.Router();

router.get('/', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  var status = req.query.status;

  db.query("SELECT * FROM klant", function(err, rows)
  {
    if(err) throw err;
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
    if(err) throw err;
  
    if(rows.length == 0)
      return res.redirect('/weekstaat?status=Er zijn geen dagstaten voor deze week!');
    else
    {

      var dagstaten = rows;

      dagstaten.forEach(function(dagstaat)
      {
        if(dagstaat.dag_begin && dagstaat.dag_eind)
          {
            var time1 = new Date("01/01/2017 " + dagstaat.dag_begin.substr(0,5));   
            var time2 = new Date("01/01/2017 " + dagstaat.dag_eind.substr(0,5));

            if(time2 < time1)
                time2 = new Date("02/01/2017 " + dagstaat.dag_eind);


            var difference = new Date(time2.getTime() - time1.getTime());

            var hours = difference.getHours() - parseInt(dagstaat.pauze);
            var minutes = difference.getMinutes();
            var total = (hours > 10 ? hours : "0" + hours) + ":" + (minutes > 10 ? minutes : "0" + minutes);

            dagstaat.dag_totaal = total;
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
