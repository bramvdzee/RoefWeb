PDFDocument = require './lib/document'
doc = new PDFDocument

# Register a font name for use later
doc.registerFont('Palatino-Bold', 'demo/fonts/PalatinoBold.ttf')

data = [
  { code: '0001', name: 'Black table', quantity: '10', price: '$ 19.20' }
  { code: '0005', name: 'White table', quantity: '8',  price: '$ 19.20' }
  { code: '0012', name: 'Red chair',   quantity: '40', price: '$ 12.00' }
]
	
options =
	columns: [
		{ id: 'code',     width: 10, name: 'Code' }
		{ id: 'name',     width: 40, name: 'Name' }
		{ id: 'quantity', width: 25, name: 'Quantity' }
		{ id: 'price',    width: 25, name: 'Price' }
	]
	font: 'Helvetica'
	boldFont: 'Palatino-Bold'
	margins:
		left: 20
		top: 40
		right: 20
		bottom: 0
	padding:
		left: 10
		top: 10
		right: 10
		bottom: 10


doc.table(data, options)


doc.write("output.pdf")
