const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../middleware/firebaseAdmin');
require('dotenv').config();

const router = express.Router();
const usersRef = db.ref('users');

// Register endpoint
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Missing fields'
      });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      usersRef.push({ username, email, password: hashedPassword }, (error) => {
        if (error) {
          return res.status(500).json({
            error: true,
            message: 'Error registering user'
          });
        }
        res.status(201).json({
          error: false,
          message: 'User registered successfully'
        });
      });
    } catch (err) {
      res.status(500).json({
        error: true,
        message: 'Server error'
      });
    }
  });
  
  // Login endpoint
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Missing fields'
      });
    }
  
    usersRef.orderByChild('email').equalTo(email).once('value', async (snapshot) => {
      const userData = snapshot.val();
      if (!userData) {
        return res.status(404).json({
          error: true,
          message: 'User not found'
        });
      }
  
      const userKey = Object.keys(userData)[0];
      const user = userData[userKey];
  
      try {
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (!passwordMatch) {
          return res.status(401).json({
            error: true,
            message: 'Invalid password'
          });
        }
  
        const token = jwt.sign({ userId: userKey }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
        res.json({
          error: false,
          message: 'Login successful',
          token
        });
      } catch (err) {
        res.status(500).json({
          error: true,
          message: 'Server error'
        });
      }
    });
  });
  
  module.exports = router;