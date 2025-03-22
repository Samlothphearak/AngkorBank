const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    monthlySpending: {
        type: Number,
        default: 0,
    },
    savingsGoal: {
        type: Number,
        default: 0,
    },
    savingsProgress: {
        type: Number,
        default: 0,
    },
    creditScore: {
        type: Number,
        default: 0,
    },
    creditScoreRating: {
        type: String,
        enum: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
        default: 'Fair',
    },
    netWorth: {
        type: Number,
        default: 0,
    },
    investmentGrowth: {
        type: Number,
        default: 0,
    },
    debtToIncomeRatio: {
        type: Number,
        default: 0,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Insight = mongoose.model('Insight', insightSchema);

module.exports = Insight;