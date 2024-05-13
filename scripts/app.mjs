// modules
import express from "express";
import path from 'path';
import { fileURLToPath } from "url";

// utils
import router from './utils/routes.mjs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express()
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..'))

app.use('/uploads', express.static(path.join(__dirname, './uploadsFolder')))
app.use('/styles', express.static(path.join(__dirname, '../styles')));
app.use('/', router);

// app.get('/download/:fileId', (req, res) => {
//   const { fileId } = req.params;
//   const { expires } = req.query;

//   if (fileMetadata[fileId]) {
//     // check if the file is expyred
//     if (new Date(expires) > Date.now()) {
//       return res.status(403).send('Download link has expired');
//     }
    
//     const fileData = fileMetadata[fileId];
//     if (!fileData) {
//       return res.status(404).send('File not found.')
//     }

//     res.set({
//       'Content-Type': 'application/octet-stream',
//       'Content-Disposition': `attachment; filename="${fileData.filename}"`
//     })
//     res.send(fileData.fileBuffer);
//   } else {
//     res.status(404).send('File not found.')
//   }
// })



// start the server on port
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
})