// utils/insightCalculations.js

// Helper function to determine credit score rating
const getCreditScoreRating = (creditScore) => {
    if (creditScore >= 800) return "Excellent";
    if (creditScore >= 740) return "Very Good";
    if (creditScore >= 670) return "Good";
    if (creditScore >= 580) return "Fair";
    return "Poor";
  };
  
  // Calculate insights
  const calculateInsights = async (userId, transactions) => {
    // Calculate monthly spending
    const monthlySpending = transactions
      .filter(
        (t) =>
          t.type === "withdraw" &&
          t.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  
    // Calculate savings progress (example: $5,000 savings goal)
    const savingsGoal = 5000;
    const savingsProgress = (
      (transactions
        .filter((t) => t.type === "deposit")
        .reduce((sum, t) => sum + t.amount, 0) /
        savingsGoal) *
      100
    ).toFixed(2);
  
    // Placeholder functions for other metrics
    const creditScore = 750; // Replace with actual logic
    const netWorth = 100000; // Replace with actual logic
    const investmentGrowth = 12.5; // Replace with actual logic
    const debtToIncomeRatio = 25; // Replace with actual logic
  
    // Return insights object
    return {
      monthlySpending,
      savingsGoal,
      savingsProgress,
      creditScore,
      creditScoreRating: getCreditScoreRating(creditScore),
      netWorth,
      investmentGrowth,
      debtToIncomeRatio,
    };
  };
  
  module.exports = calculateInsights;