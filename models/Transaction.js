const mongoose = require('mongoose');

// Helper function to generate a custom transaction ID
const generateTransactionId = async () => {
  let isUnique = false;
  let transactionId = '';
  while (!isUnique) {
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    transactionId = `TX${randomNumber}`;
    const existingTransaction = await Transaction.findOne({ transactionId });
    if (!existingTransaction) {
      isUnique = true; // Only break if ID is unique
    }
  }
  return transactionId;
};

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true, // Ensure it is unique
    required: true,
    default: generateTransactionId, // Use the custom ID generator
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw', 'transfer'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
});

// Create the Transaction model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
  Transaction,
  generateTransactionId, // Export the function so it can be used elsewhere
};