const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the public folder
app.use('/songs', express.static(path.join(__dirname, 'public/songs')));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/songs', require('./routes/songRoutes'));
app.use('/api/playlists', require('./routes/playlistRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// Default route for API root
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to MoodWave API' });
});

// Direct test HTML page
app.get('/direct-register', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Direct Test Registration</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; }
          input, button { width: 100%; padding: 8px; margin-bottom: 10px; }
          button { background: #4CAF50; color: white; border: none; cursor: pointer; }
          .error { color: red; margin-top: 10px; }
          pre { background: #f5f5f5; padding: 10px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>Direct Test Registration</h1>
        <p>This form directly calls the test endpoint without using React or any complex frontend.</p>
        <form id="registerForm">
          <input type="text" id="username" placeholder="Username" required />
          <input type="email" id="email" placeholder="Email" required />
          <input type="password" id="password" placeholder="Password" required />
          <button type="submit">Register</button>
        </form>
        <div id="result" class="error"></div>
        <div>
          <h3>Response:</h3>
          <pre id="response"></pre>
        </div>
        
        <script>
          document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            document.getElementById('result').innerHTML = 'Submitting...';
            
            try {
              const response = await fetch('/api/test-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
              });
              
              const data = await response.json();
              document.getElementById('response').textContent = JSON.stringify(data, null, 2);
              
              if (response.ok) {
                document.getElementById('result').innerHTML = 'Success! User registered.';
                document.getElementById('result').style.color = 'green';
              } else {
                document.getElementById('result').innerHTML = 'Error: ' + (data.message || data.error || 'Unknown error');
                document.getElementById('result').style.color = 'red';
              }
            } catch (error) {
              document.getElementById('result').innerHTML = 'Error: ' + error.message;
              document.getElementById('response').textContent = error.toString();
            }
          });
        </script>
      </body>
    </html>
  `);
});

// Direct test route for user registration
app.post('/api/test-register', async (req, res) => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');

    console.log('Test Register endpoint hit', req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash: hashedPassword,
    });

    if (user) {
      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({
      message: 'Server Error during test registration',
      error: error.message,
      stack: error.stack,
    });
  }
});

// Create a completely standalone registration endpoint with ZERO middleware
app.post('/direct-register-api', async (req, res) => {
  try {
    console.log('DIRECT REGISTER API CALLED');
    console.log('Body:', req.body);

    const User = require('./models/User');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.log('Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('Checking if user exists');
    const userExists = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (userExists) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating password hash');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Creating user');
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
    });

    if (user) {
      console.log('User created successfully:', user._id);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      console.log('Sending success response');
      return res.status(201).json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      console.log('Failed to create user');
      return res.status(400).json({ message: 'Failed to create user' });
    }
  } catch (error) {
    console.error('DIRECT REGISTRATION ERROR:', error);
    return res.status(500).json({
      message: 'Registration failed',
      error: error.message,
      stack: error.stack,
      details: error.toString()
    });
  }
});

// Standalone registration form
app.get('/register-form', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple Registration</title>
      <style>
        body { font-family: Arial; max-width: 500px; margin: 20px auto; padding: 20px; }
        h1 { color: #333; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; box-sizing: border-box; }
        button { background: #4CAF50; color: white; border: none; padding: 10px 15px; cursor: pointer; }
        .error { color: red; margin: 10px 0; }
        .success { color: green; margin: 10px 0; }
        #response { background: #f5f5f5; padding: 10px; margin-top: 20px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1>Simple Registration Form</h1>
      <div id="form-container">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" required>
        </div>
        <button id="register-btn">Register</button>
      </div>
      
      <div id="message" class=""></div>
      <div id="response"></div>
      
      <script>
        document.getElementById('register-btn').addEventListener('click', async () => {
          const username = document.getElementById('username').value;
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          
          const message = document.getElementById('message');
          const response = document.getElementById('response');
          
          if (!username || !email || !password) {
            message.className = 'error';
            message.textContent = 'All fields are required!';
            return;
          }
          
          message.className = '';
          message.textContent = 'Registering...';
          
          try {
            const result = await fetch('/direct-register-api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, email, password })
            });
            
            const data = await result.json();
            response.textContent = JSON.stringify(data, null, 2);
            
            if (result.ok) {
              message.className = 'success';
              message.textContent = 'Registration successful!';
              // Store token
              localStorage.setItem('token', data.token);
            } else {
              message.className = 'error';
              message.textContent = 'Error: ' + (data.message || 'Registration failed');
            }
          } catch (error) {
            message.className = 'error';
            message.textContent = 'Error: ' + error.message;
            response.textContent = error.toString();
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../', 'client', 'build', 'index.html')
    )
  );
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 