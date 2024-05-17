import sql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

const db = sql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE
})

db.connect((err) => {
  if (err) {
    console.error('Error connecting to db:', err);
  } else {
    console.log('Connecting to db successfully.');
  }
})

export default db;