import express from 'express';
import session from 'express-session';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import env from 'env';
import { fileURLToPath } from 'url';
import { hasSubscribers } from 'diagnostics_channel';


// * initialize SQLite db
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new sqlite3.Database(path.join(__dirname, '../database.db'));

// * running db
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  password TEXT
)`, (err) => {
  if (err) {
    console.error('Error on creating table.');
  } else {
    console.log('Successfully creating table.');
  }
})

// * initialize express app / sesion / router
const router = express.Router();
const app = express();

app.use(session({
  secret: process.env.SECURITY_KEY || '12345678',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));



// * post
// & user registration route
router.post('/register', async (req, res) => {
  const { email, username, password, passwordRepeat } = req.body;

  // if the fields are not empty
  if (!email || !username || !password || !passwordRepeat) {
    return res.render('register', { message: 'All fields are required.' });
  }

  // if the passwords are the same
  if (password !== passwordRepeat) {
    return res.render('register', { message: 'Passwords do not match.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // insert into db
    db.run('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword], (err) => {
      if (err) {
        console.error('Error registering user:', err.message);
        // if the user already exist
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.render('register', { message: 'Username or email already exists.' });
        }
        return res.render('register', { message: 'Error registering user.' });
      } else {
        const userData = {
          email: email,
          username: username,
          timestamp: new Date().toISOString().split('T')[0]
        }
        return res.render('user', { message: 'User registered successfully.', data: userData }); // * YOU NEED TO REDIRECT DATA TO THE URL THEN GET IT AND SET TO THE PROFILE PARAMETERS 
      }
    })
  } catch (err) {
    console.error('Build', err);
    return res.render('register', { message: 'Error registering user.'});
  }
})

// & user auth route
// router.post('/login', (req, res) => {
//   const { username, password } = req.body;

//   db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err) => {
//     if (err) {
//       console.error('Error logging in:', err);
//       res.render('auth', { message: 'Error logging in' });
//     } else if (user) {
//       req.session.user = user; // store data user in session
//       res.render('auth', { message: 'Users successfully logged in.' });
//       console.log(req.session.user);
//     } else {
//       res.render('auth', { message: 'Invalid username or password' });
//     }
//   })
// })

// * get
// & index page route
router.get('/', (req, res) => {
  res.render('index', { message: '' });
})
// & login page route
router.get('/login', (req, res) => {
  res.render('login', { message: '' })
})
// & register page route
router.get('/register', (req, res) => {
  res.render('register', { message: '' })
})
// & user page route
router.get('/user', (req, res) => {
  res.render('user', { message: '', data: '' })
})
 

// & user logout route
// router.get('/logout', (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       res.render('index', { message: 'Error loging out.' });
//     } else {
//       res.render('index', { message: 'Session destroyed' });
//     }
//   })
// })

export default router;