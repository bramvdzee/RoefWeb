var PdfPrinter = require('pdfmake/src/printer');
var fs = require('fs');

module.exports = {

    fonts: {
        Roboto: {
            normal: './public/fonts/Roboto-Regular.ttf',
            bold: './public/fonts/Roboto-Medium.ttf',
            italics: './public/fonts/Roboto-Italic.ttf',
            bolditalics: './public/fonts/Roboto-Italic.ttf'
        }
    },

    generateDagstaat: function(res, dagstaat)
    {

        var fileName = "Dagstaat_" + dagstaat.id + ".pdf";

        var printer = new PdfPrinter(this.fonts);

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
                            text: 'Dagstaat No. ' + dagstaat.id,
                            style: ['right', 'regular']
                        }
                    ],

                },
                {
                    margin: [0,10],
                    columns:
                    [
                        {
                            text: 'Het Schild 18 \n5275 EB Den Dungen \nTel  (073) 594 10 04 \nMob. Tel. 06 - 22 80 26 96 \nEmail administratie@vofderoef.nl',
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
                    text:
                    [
                                {text: "Werkbonnen afgegeven aan: ", style: ['regular','bold']},
                                {text: dagstaat.afgifte + "\n", style: 'regular'},
                    ],
                },
                {
                    margin: [0,0,0,20],
                    columns:
                    [
                        {
                            text:
                            [
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
                    
                            text: 'Inschrijfnummer Kamer van Koophandel Oost-Brabant 160.48.725  |  Wij rijden onder A.V.C./CMR condities.',
                            width: 'auto',
                            style: 'smaller',
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
                        alignment: 'center'
                    }
            }
        };

        this.downloadPdf(res, fileName, dd, printer);

        

    },

    generateWeekstaat: function(res, week, jaar, dagstaten)
    {

        var weekstaatId = dagstaten[0].klant_id + "" + week + "" + jaar;
        var fileName = "Weekstaat_" + weekstaatId + ".pdf";
        var printer = new PdfPrinter(this.fonts);

        var data = [];

        for(var i = 0; i < dagstaten.length; i++)
        {
            var dagstaat = dagstaten[i];

            if(!data[dagstaat.datum])
                data[dagstaat.datum] = [];

            data[dagstaat.datum].push(dagstaat);

        }

        var body = [];
        body.push([{text: 'Datum', style: 'tableHeader'}, {text: 'Dagstaat ID', style: 'tableHeader'}, {text: 'Wagentype', style: 'tableHeader'}, {text: 'Totaal uren', style: 'tableHeader'}]);

        Object.keys(data).forEach(function (key) {

            var datum = key;
            var realDatum = new Date(datum);
            var m = (parseInt(realDatum.getMonth()) + 1);
            var date = (realDatum.getDate() < 10 ? "0" + realDatum.getDate() : realDatum.getDate());
            var month = (m < 10 ? "0" + m : m);
            var year = realDatum.getFullYear();

            body.push([{text: date + "/" + month + "/" + year}, '','','']);


            for(var i = 0; i < data[datum].length; i++)
            {
                var dagstaat = data[datum][i];

                body.push([
                    '', 
                    {text: dagstaat.id},
                    {text: dagstaat.wagentype},
                    {text: dagstaat.dag_totaal + ""}
                ]);
            }

            body.push(['\n','\n','\n','\n']);


        });
        

        var dd = {
            pageSize: 'A4',
            pageOrientation: 'portrait',

            header: 
            {

                columns:
                [
                    {
                        width:'50%',
                        alignment: 'left',
                        margin: [40,10],
                        image: './public/images/dagstaat_logo.jpg',
                        fit: [182,63]    
                    },
                    {
                        width:'50%',
                        text: 
                        [
                            {text: 'Weekstaat No. ' + weekstaatId + '\n\n', style: 'header'},
                            {text: 'Opdrachtgever: ' + dagstaten[0].klant_naam + '\n\n', style: 'header'},
                            {text: 'Week: ' + week + '/' + jaar, style: 'header'},
                        ],
                        alignment: 'right',
                        margin: [40,10],
                    }
                ]
            },

            content: {
                margin: [0,20,0,0],
                table: {
                    headerRows: 1,
                    widths: ['40%', '20%', '20%', '20%'],
                    body: body
                },
                layout: 'noBorders'
            },
            styles:
            {
                header: {
                    fontSize: 11,
                },
                tableHeader: {
                    bold:true,
                    fillColor: '#B0D1FF',
                },
                bold: {
                    bold:true,
                },
            },
            pageMargins: [40, 80, 40, 60]
               
        };

        this.downloadPdf(res, fileName, dd, printer);

    },

    downloadPdf: function(res, fileName, dd, printer)
    {

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