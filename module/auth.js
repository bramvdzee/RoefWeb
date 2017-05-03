var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var config = require('../config/config');

module.exports = {

    requireLoggedIn: function(req, res, next) {     

        if (!req.query.authToken) {
            return res.status(401).json({message: 'U moet ingelogd zijn om deze pagina te bezoeken.'});
        } else if (!req.query.api_key){
            return res.status(401).json({message: 'U heeft geen recht om deze pagina te bezoeken.'});
        } else if (req.query.api_key != config.app_api_key){
            return res.status(401).json({message: 'U heeft geen recht om deze pagina te bezoeken.'});
        }
        
        var db = req.app.locals.connection;
        db.query("SELECT m.*, r.naam as rolnaam from medewerker AS m INNER JOIN rol AS r ON m.rol_id = r.id WHERE authToken = '" + req.query.authToken + "' LIMIT 1", function(err,rows){
            if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

            if(rows.length != 1)
                return res.status(500).json({ message: 'Deze token is niet valid' });

            var difference = new Date(getCurrentDate()).getTime() - rows[0].token_exp;
            if(difference > 86400000)
                return res.status(417).json({message: 'De sessie is verlopen. Log opnieuw in.'});

            db.query("UPDATE medewerker SET token_exp = '" + getCurrentDate() + "' WHERE authToken = '" + req.query.authToken + "'", function(err, obj)
            {
                if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });
                req.rol = rows[0].rolnaam;
                return next();
            });

            

        });

    },
    
    requireRole: function(role) {
        return function(req, res, next) {
            userRole = req.rol;

            if (userRole == role)
                return next();
            
            return res.status(403).json({message: 'U heeft geen rechten om deze pagina te bezoeken.'});
        }
    },


    
    // Try to login the user.
    login: function(req, res, username, password) {
        var db = req.app.locals.connection;

        username = username.trim();
        password = password.trim();

        db.query("SELECT m.*, r.naam as rolnaam FROM medewerker AS m INNER JOIN rol AS r ON m.rol_id = r.id WHERE gebruikersnaam = '" + username + "'", function(err, user)
        {
            if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

            user = user[0];
            if(!user)
            {
                var fail = onLoginFail(req.connection.remoteAddress);

                if (fail && Date.now() < fail.nextTry) {
                    return res.status(429).json({message: 'Te vaak geprobeerd opnieuw in te loggen, probeer het over 10 minuten nogmaals'});
                } else {
                    return res.status(401).json({message: 'U heeft een verkeerde gebruikersnaam of wachtwoord ingevuld.' });
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

                            if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

                            return res.status(200).json({
                                    message: "OK",
                                    authToken: authToken,
                                    
                                    id: user.id,
                                    voornaam: user.voornaam,
                                    tussenvoegsel: user.tussenvoegsel,
                                    achternaam: user.achternaam,
                                    rol: user.rolnaam
                                });
                        });
                        
                    } else {
                        return res.status(401).json({ message: "U heeft een verkeerde gebruikersnaam of wachtwoord ingevuld." });
                    }
                });

            }

        });

    },
    
    // Logs the user out.
    logout: function(req) {
        
        var db = req.app.locals.connection;

        db.query("UPDATE medewerker SET authToken = '' WHERE authToken = '" + req.query.authToken + "'", function(err, rows)
        {
            if(err) return res.status(500).json({ message: 'Er is een fout opgetreden. Probeer het later opnieuw.' });

            req.next();
        });

    }
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