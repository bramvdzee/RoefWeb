var bcrypt = require('bcryptjs');
var crypto = require('crypto');

module.exports = {

    message: null,

    requireLoggedin: function(req, res, next)
    {

        var storage = req.app.locals.storage;
        var db = req.app.locals.connection;
        var auth = storage.getItem("authToken");
        if(!auth)
        {
            return res.redirect("login");
        }
        
        db.query("SELECT m.*, r.naam as rolnaam from medewerker AS m INNER JOIN rol AS r ON m.rol_id = r.id WHERE authToken = '" + auth + "' LIMIT 1", function(err,rows){
            if(err) throw err;

            if(rows.length != 1)
                return res.redirect("login");

            var difference = new Date(getCurrentDate()).getTime() - rows[0].token_exp;
            if(difference > 86400000)
                return res.redirect("login");

            storage.setItem("rolnaam", rows[0].rolnaam);
            return next();

        });            

    },

    login: function(req, res, username, password) {
        var db = req.app.locals.connection;
        var storage = req.app.locals.storage;

        username = username.trim();
        password = password.trim();

        db.query("SELECT m.*, r.naam as rolnaam FROM medewerker AS m INNER JOIN rol AS r ON m.rol_id = r.id WHERE gebruikersnaam = '" + username + "'", function(err, user)
        {
            if(err) throw err;

            user = user[0];
            if(!user)
            {
                var fail = onLoginFail(req.connection.remoteAddress);

                if (fail && Date.now() < fail.nextTry) {
                    return res.redirect("login?message=1");
                } else {
                    return res.redirect("login?message=2");
                    
                }  
            }
            else
            {
                onLoginSuccess(req.connection.remoteAddress);

                bcrypt.compare(password, user.wachtwoord, function(err, result) {
                    if (result) {
                        var authToken = crypto.randomBytes(64).toString('hex');
                        
                        // Get current data in the right formate
                        var date = getCurrentDate();
                        
                        db.query("UPDATE medewerker SET authToken = '" + authToken + "', token_exp = '" + date + "' WHERE id = " + user.id + "", function(err, rows)
                        {

                            if(err) throw err;

                            storage.setItem("authToken", authToken);
                            return res.redirect("/");
                        });
                        
                    } else {
                        return res.redirect("login?message=3");
                         
                    }
                });

            }

        });

    },

    
};

function getCurrentDate(){
    var d = new Date();

    var date = "" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();            
    return date;
}

// Stores all the failed logins for a max of 30 min
var failures = {};

function onLoginFail(ip) {
    var fail = failures[ip];
    if (fail == undefined) var fail = failures[ip] = {count: 0, nextTry: new Date()};
    
    ++fail.count;
    // If 5 attempts, wait 10 min to try again
    if (fail.count == 5){
         fail.nextTry.setTime(Date.now() + MINS10); // Wait another two seconds for every failed attempt
    }
   
    return fail;
}

function onLoginSuccess(ip) { delete failures[ip]; }

// Clear log every 30 min
var MINS10 = 600000, MINS30 = 1 * MINS10;
setInterval(function() {
    for (var ip in failures) {
        if (Date.now() - failures[ip].nextTry > MINS10) {
            delete failures[ip];
        }
    }
}, MINS30);