const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
// const chokidar = require('chokidar');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const OPENOFFICE_PATH = "C:\\Program Files (x86)\\OpenOffice 4\\program\\soffice.exe";
const TEMP_DIR = path.join(__dirname, 'temp');

app.post('/generate-pdf', (req, res) => {
  console.log('Received request:', req.body);

  fs.readFile(path.resolve(__dirname, 'Format Formulir LPJ PUM.docx'), (err, content) => {
    if (err) {
      console.error('Error reading template file:', err);
      return res.status(500).json({ error: 'Failed to read template file' });
    }
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
    console.log('DOCX buffer generated');

    // Ensure temp directory exists
    fs.mkdir(TEMP_DIR, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating temp directory:', err);
        return res.status(500).json({ error: 'Failed to create temp directory' });
      }

      const tempDocxPath = path.join(TEMP_DIR, 'temp.docx');
      fs.writeFile(tempDocxPath, buf, (err) => {
        if (err) {
          console.error('Error writing temporary DOCX file:', err);
          return res.status(500).json({ error: 'Failed to write temporary DOCX file' });
        }
        console.log('Temporary DOCX file saved');

        // Open the document in OpenOffice
        exec(`"${OPENOFFICE_PATH}" "${tempDocxPath}"`, (error) => {
          if (error) {
            console.error('Error opening OpenOffice:', error);
            return res.status(500).json({ error: 'Failed to open OpenOffice' });
          }
          console.log('Document opened in OpenOffice');
        });

        // Watch for PDF file creation
        // const watcher = chokidar.watch(TEMP_DIR, { ignored: /^\./, persistent: true });
        
        // watcher.on('add', (filePath) => {
        //   if (path.extname(filePath).toLowerCase() === '.pdf') {
        //     console.log('PDF file detected:', filePath);
            
        //     // Close OpenOffice
        //     exec('taskkill /F /IM soffice.bin', (error) => {
        //       if (error) {
        //         console.error('Error closing OpenOffice:', error);
        //       } else {
        //         console.log('OpenOffice closed successfully');
        //       }

        //       // Read the PDF file
        //       fs.readFile(filePath, (err, pdfContent) => {
        //         if (err) {
        //           console.error('Error reading PDF file:', err);
        //           return res.status(500).json({ error: 'Failed to read PDF file' });
        //         }

        //         // Delete temporary files
        //         fs.unlink(tempDocxPath, (err) => {
        //           if (err) console.error('Error deleting temporary DOCX file:', err);
        //         });
        //         fs.unlink(filePath, (err) => {
        //           if (err) console.error('Error deleting temporary PDF file:', err);
        //         });

        //         // Stop watching the directory
        //         watcher.close();

        //         // Send the PDF file
        //         res.setHeader('Content-Type', 'application/pdf');
        //         res.setHeader('Content-Disposition', 'attachment; filename="LPJ_PUM.pdf"');
        //         res.send(pdfContent);
        //       });
        //     });
        //   }
        // });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
