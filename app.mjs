import express from "express";
import path from 'path';
import { fileURLToPath } from "url";
import session from 'express-session';
import cookie from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

// import routes
import router from './sources/routes/routes.mjs';

// define path for static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticPath = path.join(__dirname + '/static');

// create app / setting view engine / views path
const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(staticPath));
app.use(cookie());

// configure session middleware
app.use(session({
  secret: process.env.SECRET_KEY || 'secret key',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false, httpOnly: true}
}));

// user router
app.use('/', router);

// start the server localy
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
})