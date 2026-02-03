const Account = require('../models/Account');

// Get all accounts
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.userId });
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add account
exports.addAccount = async (req, res) => {
  try {
    const { name, balance, type, color, icon } = req.body;

    const account = new Account({
      userId: req.userId,
      name,
      balance: balance || 0,
      type,
      color,
      icon
    });

    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error('Add account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Transfer money between accounts
exports.transferMoney = async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fromAccount = await Account.findOne({ _id: fromAccountId, userId: req.userId });
    const toAccount = await Account.findOne({ _id: toAccountId, userId: req.userId });

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Update account balances
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save();
    await toAccount.save();

    // Create transaction record for transfer history
    const Transaction = require('../models/Transaction');
    const transferTransaction = new Transaction({
      userId: req.userId,
      type: 'transfer',
      amount: amount,
      description: description || `Transfer from ${fromAccount.name} to ${toAccount.name}`,
      account: fromAccount.name,
      fromAccount: fromAccount.name,
      toAccount: toAccount.name,
      dateTime: new Date()
    });

    await transferTransaction.save();

    res.json({ 
      message: 'Transfer successful',
      fromAccount,
      toAccount,
      transaction: transferTransaction
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update account
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const account = await Account.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updates,
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await Account.findOneAndDelete({ _id: id, userId: req.userId });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
