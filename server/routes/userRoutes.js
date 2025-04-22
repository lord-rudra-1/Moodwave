const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Test route for direct registration testing
router.get('/test-register', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Test Registration</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; }
          input, button { width: 100%; padding: 8px; margin-bottom: 10px; }
          button { background: #4CAF50; color: white; border: none; cursor: pointer; }
          .error { color: red; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h1>Test User Registration</h1>
        <form id="registerForm">
          <input type="text" id="username" placeholder="Username" required />
          <input type="email" id="email" placeholder="Email" required />
          <input type="password" id="password" placeholder="Password" required />
          <button type="submit">Register</button>
        </form>
        <div id="result" class="error"></div>
        
        <script>
          document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
              const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
              });
              
              const data = await response.json();
              
              if (response.ok) {
                document.getElementById('result').innerHTML = 'Success! User registered.';
                document.getElementById('result').style.color = 'green';
              } else {
                document.getElementById('result').innerHTML = 'Error: ' + (data.message || data.error || 'Unknown error');
              }
            } catch (error) {
              document.getElementById('result').innerHTML = 'Error: ' + error.message;
            }
          });
        </script>
      </body>
    </html>
  `);
});

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

module.exports = router; 