import express from 'express';
import multer from "multer";
import Sharp from "sharp";
import path from 'path';
import fs from 'fs';
import { addSeconds } from 'date-fns';
import { fileURLToPath } from 'url';

// utils
import generateUniqueIds from "./genIds.mjs";
import generateDownloadLinks from "./genLinks.mjs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// multer config
const fileMetadata = {};
let fileId;
const storagePath = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${path.join(__dirname, '../../uploadsFolder')}`);
  },
  filename: function (req, file, cb) {
    fileId = generateUniqueIds();
    cb(null, `${fileId}${path.extname(file.originalname)}`);
  }
})
const uploads = multer({ storage: storagePath });

// get
router.get('/', (req, res) => {
  res.render('index', { link: '', filename: '' });
})
router.get('/download/:linkId', (req, res) => {
  const { linkId } = req.params;
  const { expires } = req.query;

  const filePath = path.join(__dirname, '../../uploadsFolder', linkId);
  console.log('File path:', filePath);
  console.log('Expiration date:', expires);

  const expirationDate = new Date(expires);

  // check if the file is valid / not expired yet
  if (expirationDate < new Date()) {
    res.status(500).send('The link has been expyre.');
  } else if (fs.existsSync(filePath)) {
    // headers for download file
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${linkId}"`,
    });
    // stream the file to the response
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).send('File not found or expired.')
  }
})

// post
router.post('/uploads', uploads.single('photo'), async (req, res) => {

  try {

    if (!req.file) {
      throw new Error('no file were uploaded');
    }

    // setting sharp
    await Sharp(req.file.path)
    .resize(800, 600)
    .png()
    .toBuffer( async (err, resizedBuffer, info) => {

      // checking buffer
      if (err) {
        res.status(500, 'Buffer\'s going wrong.')
      }

      // generate random unique id
      const fileId = req.file.filename;

      // store metadata bout the uploaded file
      fileMetadata[fileId] = {
        filename: req.file.filename,
        size: req.file.size,
        timestamp: new Date(),
        fileBuffer: resizedBuffer, 
        message: `Type: ${req.file.mimetype} | Width: ${info.width} | Height: ${info.height}`,
        type: req.file.mimetype
      }

      // generate time-limited download link
      const expirationDate = addSeconds(new Date(Date.now()), 5);
      const downloadLink = generateDownloadLinks(fileId, expirationDate);
      
      // return the download link to the client
      // ^ res.status(200).json( {downloadLink} );

      // return buffer img
      res.render('index', { link: downloadLink, filename: fileId})
    });
    
  } catch (err) {
    res.status(400, 'Bad Buffer.')
  }
  
})

export default router;