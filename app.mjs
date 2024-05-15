// * modules
import express from "express";
import path from 'path';
import { fileURLToPath } from "url";

// * utils
import router from './sources/routes/routes.mjs';

// * define path / engine / app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname)
const staticPath = path.join(__dirname + '/static');
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views') 


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(staticPath));
app.use('/', router);

// * start the server localy
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
})