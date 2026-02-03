const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// Add transaction
exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, description, category, division, account, dateTime } = req.body;

    // Create transaction
    const transaction = new Transaction({
      userId: req.userId,
      type,
      amount,
      description,
      category,
      division,
      account,
      dateTime: dateTime || new Date()
    });

    await transaction.save();

    // Update account balance
    const accountDoc = await Account.findOne({ userId: req.userId, name: account });
    if (accountDoc) {
      const change = type === 'income' ? amount : -amount;
      accountDoc.balance += change;
      await accountDoc.save();
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const { category, division, type, account, startDate, endDate } = req.query;
    
    const filter = { userId: req.userId };

    if (category) filter.category = category;
    if (division) filter.division = division;
    if (type) filter.type = type;
    if (account) filter.account = account;
    if (startDate || endDate) {
      filter.dateTime = {};
      if (startDate) filter.dateTime.$gte = new Date(startDate);
      if (endDate) filter.dateTime.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter).sort({ dateTime: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const transaction = await Transaction.findOne({ _id: id, userId: req.userId });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if transaction is within 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    if (transaction.createdAt < twelveHoursAgo) {
      return res.status(403).json({ error: 'Cannot edit transactions older than 12 hours' });
    }

    // Update transaction
    Object.assign(transaction, updates);
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.userId });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Reverse account balance
    const accountDoc = await Account.findOne({ userId: req.userId, name: transaction.account });
    if (accountDoc) {
      const change = transaction.type === 'income' ? -transaction.amount : transaction.amount;
      accountDoc.balance += change;
      await accountDoc.save();
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get category summary
exports.getCategorySummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      { $match: { userId: req.userId, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    const totalExpense = summary.reduce((sum, item) => sum + item.total, 0);

    const result = summary.map(item => ({
      category: item._id,
      amount: item.total,
      percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Category summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let startDate;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default: // month
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const transactions = await Transaction.find({
      userId: req.userId,
      dateTime: { $gte: startDate }
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({ income, expense, balance: income - expense });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
