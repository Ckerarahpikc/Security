import express from 'express';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

import isAuthenticated from '../utils/secureAuth.mjs';
import db from './db-config.mjs';

// get router
const router = express.Router();

// * post
// user registration route
router.post('/register', async (req, res) => {
  const { email, username, password, passwordRepeat } = req.body;

  console.log(email, username, password, passwordRepeat)

  if (!email || !username || !password || !passwordRepeat) {
    return res.render('register', { errorMessage: 'All fields are required.' });
  }

  // Check if passwords match
  if (password !== passwordRepeat) {
    return res.render('register', { errorMessage: 'Passwords do not match.' });
  }

  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user into database
    db.query('INSERT INTO users (email, name, password, register_date) VALUES (?, ?, ?, ?)', [email, username, hashedPassword, timestamp], (err) => {
      if (err) {
        // Handle registration error
        console.error('Error registering user:', err.message);
        if (err.message.includes('ER_DUP_ENTRY')) {
          return res.render('register', { errorMessage: 'Username or email already exists.' });
        }
        return res.render('register', { errorMessage: 'Error registering user.' });
      } else {
        // hold the user data
        const userData = {
          email: email,
          username: username,
          timestamp: timestamp
        };

        // Ensure session exists
        if (!req.session) {
          console.error('Session not initialized.');
          return res.render('register', { errorMessage: 'Session not initialized.'});
        }

        // Store user data in session
        req.session.user = userData;

        // Redirect user
        return res.redirect(`/login`);
      }
    });
  } catch (err) {
    console.error('Error registering user:', err.message);
    return res.render('register', { errorMessage: 'Error registering user.' });
  }
});
// user login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE name = ?', [username], async (err, results) => {
    if (err) {
      console.error('Error logging in:', err);
      return res.render('login', { errorMessage: 'Error loggin in.'});
    }

    // get only the user data
    const user = results[0];
    console.log('user:', user);

    if (!user) {
      return res.render('login', { errorMessage: 'No such user. Try to register before.'});
    }

    try {
      // compare user pass from one at the server
      if (await bcrypt.compare(password, user.password)) {
        req.session.user = {
          email: user.email,
          username: user.name,
          timestamp: user.register_date
        }
        return res.redirect('/user');
      } else {
        console.error('Invalid username or password.');
        return res.render('login', { errorMessage: 'Invalid username or password.'})
      }
    } catch (err) {
      console.error('Error logging in', err);
      return res.render('login', { errorMessage: "Error loggin in. There is registration page." });
    }
  })
})

// * get
// index page route
router.get('/', (req, res) => {
  res.render('index');
})
// login page route
router.get('/login', (req, res) => {
  res.render('login', {errorMessage: ''})
})
// register page route
router.get('/register', (req, res) => {
  res.render('register', {errorMessage: ''})
})

// user page route
router.get('/user', isAuthenticated, (req, res) => {
  // get user data from session
  res.render('user', {user: req.session.user, errorMessage: ''});
})
// user logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.render('login', { errorMessage: 'Error loging out.' });
    }
    res.clearCookie('connect.sid', { path: '/'})

    // redirect user to the home page
    return res.redirect('/');
  })
})

export default router;