module.exports = {

    requireLoggedin: function(req, res, next)
    {

        if(req.auth)
            return next();
        else
            return res.redirect("login");
            

    },

    login: function(req, res, next)
    {



    }
};
