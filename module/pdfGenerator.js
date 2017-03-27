var phantom = require('phantom');   
var fs = require('fs');

module.exports = {

    generateDagstaat: function(req, res, id)
    {

        var fileName = "Dagstaat_" + id + ".pdf";

        phantom.create().then(function(ph) {
            ph.createPage().then(function(page) {
                page.property('viewportSize', { width: 3508, height: 2480 }  );
                page.property('paperSize',{  format: 'a4', dpi: 300,  orientation: 'landscape', margin: '0cm' });
                page.open(req.protocol + "://" + req.get("host") + "/dagstaat/" + id + "/pdf").then(function(status) {
                    page.render(fileName).then(function() {
                        res.download(fileName, fileName, function(err){
                            if (err) {
                                console.log(err);
                            } else {
                                fs.unlink(fileName, (err) => {
                                    if (err) {
                                        console.log("failed to delete local image:"+err);
                                    }
                                });
                            }
                        });
                        ph.exit();
                    });
                });
            });
        });

        

    }

};