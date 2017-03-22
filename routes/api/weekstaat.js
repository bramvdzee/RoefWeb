var express = require('express');
var auth = require('../../module/auth');
var router = express.Router();

/* GET home page. */
router.post('/', auth.requireLoggedIn, auth.requireRole('Beheerder'), function(req, res, next) {
  
    if(!req.body.opdrachtgever_id || 
        !req.body.beginDate ||
        !req.body.endDate ||
        !req.body.year)
        {
            return res.status(400).json({ message: "Vul alstublieft een klant, data en jaar in!" });
        }
    
    var db = req.app.locals.connection;

    var begindatum = formatDate(req.body.beginDate);
    var einddatum = formatDate(req.body.endDate);

    db.query("SELECT dr.*, d.* FROM dagstaat_rit AS dr INNER JOIN dagstaat AS d ON dr.dagstaat_id = d.id WHERE d.datum >= '" + begindatum + "' AND d.datum <= '" + einddatum + "' ORDER BY d.datum ASC", function(err, rows)
    {

        if(err) throw err;

        res.json(rows);

    });


});

function formatDate(date)
{

    var d = new Date(date);
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();            

}

module.exports = router;
