var phantom = require('phantom');   
var fs = require('fs');

module.exports = {

    generateDagstaat: function(req, res, id)
    {

        var fileName = "Dagstaat_" + id + ".pdf";

        var pageSize = "A4",
        pageOrientation = "Landscape",
        dpi = 300, //from experimenting with different combinations of viewportSize and paperSize the pixels per inch comes out to be 150
        pdfViewportWidth = 3508,
        pdfViewportHeight = 2480,
        cmToInchFactor = 0.393701,
        widthInInches,
        heightInInches,
        temp;

    switch(pageSize){
        case 'Letter':
        default:
            widthInInches = 8.5;
            heightInInches = 11;
            break;
        case 'Legal':
            widthInInches = 8.5;
            heightInInches = 14;
            break;
        case 'A3':
            widthInInches = 11.69
            heightInInches = 16.54;
            break;
        case 'A4':
            widthInInches = 8.27;
            heightInInches = 11.69;
            break;
        case 'A5':
            widthInInches = 5.83;
            heightInInches = 8.27;
            break;
        case 'Tabloid':
            widthInInches = 11;
            heightInInches = 17;
            break;
    }

    //reduce by the margin (assuming 1cm margin on each side)
    widthInInches-= 2*cmToInchFactor;
    heightInInches-= 2*cmToInchFactor;

    //interchange if width is equal to height
    if(pageOrientation === 'Landscape'){
        temp = widthInInches;
        widthInInches = heightInInches;
        heightInInches = temp;
    }

    //calculate corresponding viewport dimension in pixels
    pdfViewportWidth = dpi*widthInInches;
    pdfViewportHeight = dpi*heightInInches;


        phantom.create().then(function(ph) {
            ph.createPage().then(function(page) {
                page.property('viewportSize', { width: pdfViewportWidth, height: pdfViewportHeight }  );
                page.property('paperSize',{  format: pageSize,  orientation: pageOrientation, margin: '0cm' });
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