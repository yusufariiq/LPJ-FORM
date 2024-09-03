const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const libre = require('libreoffice-convert');
const util = require('util');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const libreConvert = util.promisify(libre.convert);

app.post('/generate-template', async (req, res) => {
    try {
        console.log('Received request:', req.body);
        
        const templatePath = path.resolve(__dirname, 'Format Formulir LPJ PUM.docx');
        if (!fs.existsSync(templatePath)) {
            throw new Error('Template file not found');
        }
        
        const content = fs.readFileSync(templatePath, 'binary');
        console.log('Template file read successfully');
        
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
        console.log('Docxtemplater initialized');
    
        doc.render(req.body);
        console.log('Template rendered');

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });
        console.log('ZIP buffer generated');
    
        const pdfBuf = await libreConvert(buf, '.pdf', undefined);
        console.log('PDF conversion completed');

        res.contentType('application/pdf');
        res.send(pdfBuf);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Error generating PDF', details: error.message });
    }
});
  
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});