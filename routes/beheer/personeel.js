var express = require('express');
var auth = require('../../module/webAuth');
var bcrypt = require('bcryptjs');
var router = express.Router();

router.get('/', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  db.query('SELECT m.*, r.naam as rolnaam FROM medewerker as m INNER JOIN rol as r ON m.rol_id = r.id',function(err,rows){
        if(err) throw err;

        return res.render('overview/personeel_list', {data: rows});
    });

});

router.get('/:id', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  db.query('SELECT * FROM medewerker WHERE id = ' + req.params.id,function(err,rows){
        if(err) throw err;

        var medewerker = rows[0];

        db.query('SELECT * FROM rol',function(err,rows){
            if(err) throw err;

            var rollen = rows;

            var success, error;

            if(req.query.success)
                success = "De gebruiker is overal uitgelogd!";
            if(req.query.error)
                error = "De wachtwoorden komen niet overeen!";


            return res.render('details/personeel_detail', {medewerker: medewerker, rollen: rollen, success: success, error: error});
        });

    });

});

router.post('/:id', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  var voornaam = req.body.inputVoornaam;
  var tussenvoegsel = req.body.inputTussenvoegsel;
  var achternaam = req.body.inputAchternaam;
  var rol_id = req.body.inputRol;
  var gebruikersnaam = req.body.inputGebruikersnaam;
  var wachtwoord = req.body.inputWachtwoord;
  var wachtwoordRepeat = req.body.inputWachtwoordRepeat;

  var ww;

  if(wachtwoord)
  {
      if(wachtwoord != wachtwoordRepeat)
      {
        return res.redirect('/personeel/' + req.params.id + "?error=1");
      }
      ww = bcrypt.hashSync(wachtwoord);
  }

  var query;

  if(req.params.id == 0)
  {
    
    query = "INSERT INTO medewerker (voornaam, tussenvoegsel, achternaam, rol_id, gebruikersnaam, wachtwoord) VALUES ("
              + "'" + voornaam + "', "
              + "'" + tussenvoegsel + "', "
              + "'" + achternaam + "', "
              + "" + rol_id + ", "
              + "'" + gebruikersnaam + "', "
              + "'" + ww + "');";


  }
  else
  {
    query = "UPDATE medewerker SET "
                + "voornaam = '" + voornaam + "', "
                + "tussenvoegsel = '" + tussenvoegsel + "', "
                + "achternaam = '" + achternaam + "', "
                + "gebruikersnaam = '" + gebruikersnaam + "', "
                + "rol_id = " + rol_id + "" + (ww ? ", " : "");

      if(ww)
        query += "wachtwoord = '" + ww + "'";

      query += " WHERE id = " + req.params.id + ";"

  }

  db.query(query, function(err, rows)
  {
    if(err) throw err;
    return res.redirect('/personeel');
  });

  

});

router.get('/:id/delete', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  db.query("DELETE FROM medewerker WHERE id = " + req.params.id, function(err, rows)
  {
    if(err) throw err;
    return res.redirect('/personeel');
  });

});

router.get('/:id/logout', auth.requireLoggedin, function(req, res, next) {

  var db = req.app.locals.connection;

  db.query("UPDATE medewerker SET authToken='' WHERE id = " + req.params.id,function(err,rows){
        if(err) throw err;

        

    });

    return res.redirect('/personeel/' + req.params.id + "?success=1");

});



module.exports = router;