var express = require('express');
var auth = require('../../module/auth');
var router = express.Router();

router.post('/', function(req, res, next) {
  
    let username = req.body.username;
    let password = req.body.password;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Vul alstublieft een gebruikersnaam en een wachtwoord in." });
    }

    username = username.toLowerCase();
    
    auth.login(req, res, username, password);

});

module.exports = router;
