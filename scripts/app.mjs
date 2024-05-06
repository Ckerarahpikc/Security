import express from "express";
import path from 'path';

const app = express();
const PORT = 3000;

// specify the directory for views (ejs template)
app.set('views', path.join(__dirname));

// setting engine
app.set('view engine', 'ejs');

app.get('/', (res, req) => {
  req.render('index')
})

// start the server on port
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
})