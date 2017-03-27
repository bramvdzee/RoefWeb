var PdfPrinter = require('pdfmake/src/printer');
var fs = require('fs');

module.exports = {

    generateDagstaat: function(req, res, dagstaat)
    {

        var fileName = "Dagstaat_" + dagstaat.id + ".pdf";

        fonts = {
                Roboto: {
                    normal: './public/fonts/Roboto-Regular.ttf',
                    bold: './public/fonts/Roboto-Medium.ttf',
                    italics: './public/fonts/Roboto-Italic.ttf',
                    bolditalics: './public/fonts/Roboto-Italic.ttf'
                }
            };


        var PdfPrinter = require('pdfmake/src/printer');
        var printer = new PdfPrinter(fonts);

        var body = [];
        body.push(
            [{text:"Rit", style: ['regular', 'bold']},
            {text:"Opdrachtgever", style: ['regular', 'bold']},
            {text:"Laadplaats", style: ['regular', 'bold']},
            {text:"Laadplaats aankomst", style: ['regular', 'bold']},
            {text:"Laadplaats vertrek", style: ['regular', 'bold']},
            {text:"Losplaats", style: ['regular', 'bold']},
            {text:"Losplaats aankomst", style: ['regular', 'bold']},
            {text:"Losplaats vertrek", style: ['regular', 'bold']},
            {text:"Lading", style: ['regular', 'bold']},
            {text:"Hoeveelheid", style: ['regular', 'bold']}]); 

        for(var i = 0; i < dagstaat.ritten.length; i++)
        {
            var row = [];
            var rit = dagstaat.ritten[i];

            row.push({ text: rit.id, fontSize: 11});
            row.push({ text: rit.opdrachtgever, fontSize: 11});
            row.push({ text: rit.laadplaats, fontSize: 11});
            row.push({ text: rit.laadplaats_aankomst, fontSize: 11});
            row.push({ text: rit.laadplaats_vertrek, fontSize: 11});
            row.push({ text: rit.losplaats, fontSize: 11});
            row.push({ text: rit.losplaats_aankomst, fontSize: 11});
            row.push({ text: rit.losplaats_vertrek, fontSize: 11});
            row.push({ text: rit.lading, fontSize: 11});
            row.push({ text: rit.hoeveelheid, fontSize: 11});

            body.push(row);


        }


        var dd = {
            pageSize: 'A4',

            pageOrientation: 'landscape',
            content: [
                {
                    margin: [0,0],
                    columns:
                    [
                        {
                            image: './public/images/dagstaat_logo.jpg',
                            fit: [182,63]                     
                        },
                        {
                            text: 'No. ' + dagstaat.id,
                            style: ['right', 'regular']
                        }
                    ],

                },
                {
                    margin: [0,10],
                    columns:
                    [
                        {
                            text: 'Het Schild 18 \n5275 EB Den Dungen \nTel  (073) 594 10 04 \nFax  (073) 851 44 08 \nMob. Tel. 06 - 22 80 26 96 \nEmail administratie@vofderoef.nl',
                            width: '30%',
                            style: 'regular'
                        },
                        {
                            text: 'Opdrachtgever: \n \nWoonplaats: \n \nDag/Datum:',
                            width: '15%',
                            style: ['regular', 'bold']
                        },
                        {
                            text: dagstaat.klant_naam + ' \n \n' + dagstaat.woonplaats + '\n \n' + dagstaat.datum,
                            width: '*',
                            style: 'regular'
                        }
                    ]
                },
                {
                    table:
                    {
                        headerRows: 1,
                        style: 'regular',
                        widths: [ 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto' ],
                        body: body
                        
                        
                    },
                    width: '95%'
                },
                {
                    margin: [0,5,0,10],
                    text: [
                        {text: 'Opmerkingen: ', style: ['regular', 'bold']},
                        {text: dagstaat.opmerking, style: ['regular']}
                    ]
                },
                {
                    margin: [0,0,0,20],
                    columns:
                    [
                        {
                            text:
                            [
                                {text: "Werkbonnen afgegeven aan: ", style: ['regular','bold']},
                                {text: dagstaat.afgifte + "\n", style: 'regular'},
                                {text: "Transporteur: ", style: ['regular','bold']},
                                {text: dagstaat.transporteur + "\n", style: 'regular'},
                                {text: "Kenteken: ", style: ['regular','bold']},
                                {text: dagstaat.kenteken + "\n", style: 'regular'},
                                {text: "Type auto: ", style: ['regular','bold']},
                                {text: dagstaat.wagentype + "\n", style: 'regular'},
                            ],
                            width: '33%',
                            style: 'regular',
                        },
                        {
                            text:
                            [
                                {text: "Aanvangstijd: ", style: ['regular','bold']},
                                {text: dagstaat.dag_begin + "\n", style: 'regular'},
                                {text: "Eindtijd: ", style: ['regular','bold']},
                                {text: dagstaat.dag_eind + "\n", style: 'regular'},
                                {text: "Pauze: ", style: ['regular','bold']},
                                {text: dagstaat.pauze + "\n", style: 'regular'},
                                {text: "Totaal uren: ", style: ['regular','bold']},
                                {text: dagstaat.dag_totaal + "\n", style: 'regular'},
                            ],
                            width: '33%',
                            
                        },
                        {
                            text:
                            [
                                {text: "Naam Uitvoerder: ", style: ['regular','bold']},
                                {text: dagstaat.naam_uitvoerder + "\n", style: 'regular'},
                                {text: "Naam Chauffeur: ", style: ['regular','bold']},
                                {text: dagstaat.naam_chauffeur + "\n", style: 'regular'},
                            ],
                            width: '*',
                        }
                    ]
                },
                {
                    columns:
                    [
                        {
                            text: '',
                            width: '33%',
                            style: 'regular',
                        },
                        {
                            text: 'Inschrijfnummer Kamer van Koophandel Oost-Brabant 160.48.725  |  Wij rijden onder A.V.C./CMR condities.',
                            width: '*',
                            style: 'smaller'
                        }
                    ]
                }
                
                ],
                styles: {
                    bold:
                    {
                      bold:true,  
                    },
                    regular: {
                            fontSize:11,
                    },
                    right: {
                        alignment: 'right'
                    },
                    smaller:
                    {
                        fontSize: 10,
                    }
                }
            };

        var pdfDoc = printer.createPdfKitDocument(dd);
        pdfDoc.pipe(fs.createWriteStream(fileName)).on('finish',function(){
            
            res.download(fileName, fileName, function(err)
            {

                if(err) console.log(err);
                else
                {
                    fs.unlink(fileName, (err) => {
                        if(err) console.log(err);
                    });
                }

            });

        });
        pdfDoc.end();

        

    }

};