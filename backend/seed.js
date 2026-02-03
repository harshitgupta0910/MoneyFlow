const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const initialCategories = [
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: 'hsl(152, 70%, 40%)' },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: 'hsl(200, 75%, 50%)' },
  { name: 'Investment', type: 'income', icon: 'TrendingUp', color: 'hsl(45, 90%, 50%)' },
  { name: 'Other Income', type: 'income', icon: 'DollarSign', color: 'hsl(120, 60%, 50%)' },
  
  { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: 'hsl(0, 72%, 55%)' },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: 'hsl(280, 65%, 55%)' },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: 'hsl(15, 85%, 60%)' },
  { name: 'Bills & Utilities', type: 'expense', icon: 'Receipt', color: 'hsl(200, 60%, 45%)' },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: 'hsl(320, 70%, 55%)' },
  { name: 'Healthcare', type: 'expense', icon: 'Heart', color: 'hsl(340, 80%, 60%)' },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: 'hsl(220, 70%, 50%)' },
  { name: 'Travel', type: 'expense', icon: 'Plane', color: 'hsl(180, 65%, 50%)' },
  { name: 'Other Expense', type: 'expense', icon: 'MoreHorizontal', color: 'hsl(0, 0%, 50%)' },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing categories (optional)
    // await Category.deleteMany({});

    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    
    if (existingCount > 0) {
      console.log(`ℹ️  ${existingCount} categories already exist. Skipping seed.`);
      process.exit(0);
    }

    // Insert initial categories
    await Category.insertMany(initialCategories);
    console.log(`✅ Seeded ${initialCategories.length} categories successfully!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
