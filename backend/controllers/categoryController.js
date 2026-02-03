const Category = require('../models/Category');

// Get all categories (global + user-specific)
exports.getCategories = async (req, res) => {
  try {
    // Get global categories (no userId) and user-specific categories
    const categories = await Category.find({
      $or: [
        { userId: null },
        { userId: req.userId }
      ]
    });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add category
exports.addCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    const category = new Category({
      userId: req.userId,
      name,
      type,
      icon,
      color
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
