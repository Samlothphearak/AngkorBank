const mongoose = require('mongoose');

// Helper function to generate a custom transaction ID
const generateTransactionId = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
  return `TX${randomNumber}`; // Format as TX123456
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
    enum: ['deposit', 'withdraw', 'transfer'], // Added 'transfer' as a type
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0, // Ensure amount is non-negative
  },
  date: {
    type: Date,
    default: Date.now, // Default to the current date and time
  },
  description: {
    type: String,
    trim: true, // Remove extra spaces
    default: '', // Default to an empty string
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'], // Allowed statuses
    default: 'pending', // Default status
  },
});

// Create the Transaction model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;