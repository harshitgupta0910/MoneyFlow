const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Account = require('../models/Account');
const Category = require('../models/Category');

// Register user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Create default accounts for new user
    const defaultAccounts = [
      { userId: user._id, name: 'Cash', balance: 0, type: 'cash', color: 'hsl(45, 90%, 50%)', icon: 'Wallet' },
      { userId: user._id, name: 'Bank Account', balance: 0, type: 'bank', color: 'hsl(200, 75%, 50%)', icon: 'Building2' },
    ];
    await Account.insertMany(defaultAccounts);

    // Create default categories
    const defaultCategories = [
      { userId: user._id, name: 'Salary', type: 'income', icon: 'Briefcase', color: 'hsl(152, 70%, 40%)' },
      { userId: user._id, name: 'Freelance', type: 'income', icon: 'Laptop', color: 'hsl(200, 75%, 50%)' },
      { userId: user._id, name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: 'hsl(0, 72%, 55%)' },
      { userId: user._id, name: 'Transportation', type: 'expense', icon: 'Car', color: 'hsl(280, 65%, 55%)' },
      { userId: user._id, name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: 'hsl(15, 85%, 60%)' },
      { userId: user._id, name: 'Bills & Utilities', type: 'expense', icon: 'Receipt', color: 'hsl(200, 60%, 45%)' },
    ];
    await Category.insertMany(defaultCategories);

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
