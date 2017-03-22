var phantom = require('phantom');   
var fs = require('fs');

module.exports = {

    generateDagstaat: function(req, res, id)
    {

        var fileName = "Dagstaat_" + id + ".pdf";

        phantom.create().then(function(ph) {
            ph.createPage().then(function(page) {
                page.property('viewportSize', {width: 1122 ,height: 800 }  );
                page.property('paperSize', {format: 'A4', orientation: 'landscape'});
                page.open("http://roef.herokuapp.com/dagstaat/" + id + "/pdf").then(function(status) {
                    console.log("Page opened");
                    page.render(fileName).then(function() {
                        console.log("Page Rendered");
                        res.download(fileName, fileName, function(err){
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Downloading...")
                                fs.unlink(fileName, (err) => {
                                    if (err) {
                                        console.log("failed to delete local image:"+err);
                                    } else {
                                        console.log('successfully deleted local image');                                
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