require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const accountRoutes = require('./routes/accountRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
const allowedOrigin = process.env.FRONTEND_URL || 'https://money-flow-fawn.vercel.app';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Money Manager API is running' });
});

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moneymanager';
mongoose.connect(mongoUri)
  .then(() => {
    console.log(' Connected to MongoDB');
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(` Port ${PORT} is already in use. Stop other backend process before running nodemon.`);
      } else {
        console.error(' Server start error:', error);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error(' MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/', (req, res) => {
  res.send('Money Manager Backend is running!');
});

module.exports = app;
