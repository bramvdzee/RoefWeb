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
        
        var content = {};

        var imageData = (dagstaat.handtekening == null || dagstaat.handtekening == 'NULL') ? {text: ""} : {
                                            image: dagstaat.handtekening, 
                                            fit: [180,100] 
                                        };

        content.table = {};
        content.table.headerRows = 1;
        content.table.style = 'regular';
        content.table.widths = [ 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto' ];
        content.width = "95%";
        content.table.body = [];

        content.table.body.push(
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


        for(var i = 0; i < parseInt(dagstaat.ritten.length); i++)
        {
            var row = [];
            var rit = dagstaat.ritten[i];

            row.push({ text: rit.id, fontSize: 11});
            row.push({ text: rit.opdrachtgever, fontSize: 11});
            row.push({ text: rit.laadplaats, fontSize: 11});
            row.push({ text: rit.laadplaats_aankomst.substr(0,5), fontSize: 11});
            row.push({ text: rit.laadplaats_vertrek.substr(0,5), fontSize: 11});
            row.push({ text: rit.losplaats, fontSize: 11});
            row.push({ text: rit.losplaats_aankomst.substr(0,5), fontSize: 11});
            row.push({ text: rit.losplaats_vertrek.substr(0,5), fontSize: 11});
            row.push({ text: rit.lading, fontSize: 11});
            row.push({ text: rit.hoeveelheid, fontSize: 11});    

            content.table.body.push(row);

        }

        var days = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

        var dateParse = dagstaat.datum.split("/");
        var dayParse = (parseInt(dateParse[0]) < 10 ? "0" + dateParse[0] : dateParse[0]);
        var monthParse = (parseInt(dateParse[1]) < 10 ? "0" + dateParse[1] : dateParse[1]);
        var yearParse = dateParse[2];


        var date = new Date(monthParse + "/" + dayParse + "/" + yearParse);
        var dag = days[date.getDay()];

        var nacht = (dagstaat.nacht == 1 ? "(nacht) " : "");

        var dd = {
            pageSize: 'A4',

            pageOrientation: 'landscape',
            pageMargins: [40, 170, 40, 170],
            header:
            [
                {
                    margin: [40,10],
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
                    margin: [40,10],
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
                            text: dagstaat.klant_naam + ' \n \n' + dagstaat.klant_woonplaats + '\n \n' + dag + " " + nacht + (dayParse + "/" + monthParse + "/" + yearParse),
                            width: '*',
                            style: 'regular'
                        }
                    ]
                },
            ],
            content: content,
            footer:
            [
                {
                    margin: [40,5,0,10],
                    text: [
                        {text: 'Opmerkingen: ', style: ['regular', 'bold']},
                        {text: dagstaat.opmerking, style: ['regular']}
                    ]
                },
                {
                    margin:[40,0],
                    text:
                    [
                                {text: "Werkbonnen afgegeven aan: ", style: ['regular','bold']},
                                {text: dagstaat.afgifte + "\n", style: 'regular'},
                    ],
                },
                {
                    margin: [40,0,0,40],
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
                                {text: dagstaat.pauze.substr(0,5) + "\n", style: 'regular'},
                                {text: "Totaal uren: ", style: ['regular','bold']},
                                {text: dagstaat.totaal_uren.substr(0,5) + "\n", style: 'regular'},
                            ],
                            width: '33%',
                            
                        },
                        {
                            stack:
                            [
                                {
                                    text:
                                    [
                                        {text: "Naam Uitvoerder: ", style: ['regular','bold']},
                                        {text: dagstaat.naam_uitvoerder + "\n", style: 'regular'},
                                        {text: "Naam Chauffeur: ", style: ['regular','bold']},
                                        {text: dagstaat.naam_chauffeur + "\n", style: 'regular'},
                                        {text: "Handtekening Uitvoerder: ", style: ['regular','bold']},
                                    ]
                                },
                                imageData
                            ],

                            width: '*',
                        }
                    ]
                },
                {
                    text: 'Inschrijfnummer Kamer van Koophandel Oost-Brabant 67915108  |  Wij rijden onder A.V.C./CMR condities.',
                    width: 'auto',
                    style: 'smaller',
                    absolutePosition: {x: 10, y: 140}
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
        var totalData = [];

        for(var i = 0; i < dagstaten.length; i++)
        {
            var dagstaat = dagstaten[i];

            var name = dagstaat.datum;
            if(dagstaat.nacht == 1)
            {
                name += " (nacht)";
            }

            if(!data[name])
                data[name] = [];

            data[name].push(dagstaat);

        }

        for(var i = 0; i < dagstaten.length; i++)
        {
            var dagstaat = dagstaten[i];

            if(!totalData[dagstaat.wagentype])
            {
                totalData[dagstaat.wagentype] = {};
                totalData[dagstaat.wagentype].hours = 0;
                totalData[dagstaat.wagentype].minutes = 0;
            }
            
            var hours = parseInt(dagstaat.totaal_uren.split(":")[0]);
            var minutes = parseInt(dagstaat.totaal_uren.split(":")[1]);
            
            totalData[dagstaat.wagentype].hours += hours;
            totalData[dagstaat.wagentype].minutes += minutes;

            if(totalData[dagstaat.wagentype].minutes >= 60)
            {
                totalData[dagstaat.wagentype].minutes = (totalData[dagstaat.wagentype].minutes - 60);
                totalData[dagstaat.wagentype].hours++;
            }

        }

        var body = [];
        var totalBody = [];
        var days = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

        body.push([{text: 'Datum', style: 'tableHeader'}, {text: 'Dagstaat ID', style: 'tableHeader'}, {text: 'Wagentype', style: 'tableHeader'}, {text: 'Totaal uren', style: 'tableHeader'}]);
        totalBody.push([{text: 'Totaaloverzicht', style: 'tableHeader'}, {text: '', style: 'tableHeader'}, {text: 'Wagentype', style: 'tableHeader'}, {text: 'Totaal uren', style: 'tableHeader'}]);
        
        Object.keys(data).forEach(function (key) {

            var datum = key;
            var realDatum = new Date(datum);

            var m = (parseInt(realDatum.getMonth()) + 1);
            var date = (realDatum.getDate() < 10 ? "0" + realDatum.getDate() : realDatum.getDate());
            var month = (m < 10 ? "0" + m : m);
            var year = realDatum.getFullYear();

            var nightShift = (datum.indexOf("(nacht)") != -1 ? " (nacht)" : "");

            body.push([{text: days[realDatum.getDay()] + " " + date + "/" + month + "/" + year + "" + nightShift}, '','','']);


            for(var i = 0; i < data[datum].length; i++)
            {
                var dagstaat = data[datum][i];

                body.push([
                    '', 
                    {text: dagstaat.id},
                    {text: dagstaat.wagentype},
                    {text: dagstaat.totaal_uren}
                ]);
            }

            body.push(['\n','\n','\n','\n']);

        });

        Object.keys(totalData).forEach(function (key) {
        
            var hours = (parseInt(totalData[key].hours) < 10 ? "0" + totalData[key].hours : totalData[key].hours);
            var minutes = (parseInt(totalData[key].minutes) < 10 ? "0" + totalData[key].minutes : totalData[key].minutes);

            var row = ['', '', {text: key}, {text: hours + ":" + minutes}];
            totalBody.push(row);

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
                            {text: '\nWeekstaat No. ' + weekstaatId + '\n\n', style: 'header'},
                            {text: 'Opdrachtgever: ' + dagstaten[0].klant_naam + '\n', style: 'header'},
                            {text: 'Week: ' + week + '/' + jaar, style: 'header'},
                        ],
                        alignment: 'right',
                        margin: [40,10],
                    }
                ]
            },

            content: 
            [
                {
                    margin: [0,20,0,20],
                    table: {
                        headerRows: 1,
                        widths: ['40%', '20%', '20%', '20%'],
                        body: body
                    },
                    layout: 'noBorders'
            
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['40%', '20%', '20%', '20%'],
                        body: totalBody
                    },
                    layout: 'noBorders'
                }
            ],
            footer: {
                text: 'Inschrijfnummer Kamer van Koophandel Oost-Brabant 160.48.725  |  Wij rijden onder A.V.C./CMR condities.',
                width: 'auto',
                style: 'footer',
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
                footer:
                    {
                        fontSize: 10,
                        alignment: 'center'
                    }
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