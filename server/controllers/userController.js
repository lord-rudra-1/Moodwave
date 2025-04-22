const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  console.log('Register endpoint hit');
  try {
    console.log('Register request body:', req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.log('Missing required fields:', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('Registering user:', { username, email, passwordLength: password?.length });

    // Check if user exists
    console.log('Checking if user exists...');
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');

    // Create user with hashed password
    console.log('Creating user...');
    const user = await User.create({
      username,
      email,
      passwordHash: hashedPassword,
    });

    if (user) {
      console.log('User created successfully:', user._id);

      // Generate token
      console.log('Generating token...');
      const token = generateToken(user._id);
      console.log('Token generated');

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token
      });
    } else {
      console.log('Invalid user data');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error details:', error);
    // Send more specific error information
    res.status(500).json({
      message: 'Server Error during registration',
      error: error.message,
      stack: error.stack,
      details: error.toString()
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('likedSongs')
      .populate('createdPlaylists');

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        likedSongs: user.likedSongs,
        createdPlaylists: user.createdPlaylists,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile }; 