require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const session = require("express-session"); // Optional: if you decide to use session-based auth
const { check, validationResult } = require("express-validator"); // For validation
const QRCode = require("qrcode");
const sharp = require("sharp");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const User = require("./models/User");
const { generateTransactionId, Transaction } = require('./models/Transaction'); // Adjust path as needed
const Insight = require("./models/Insight");
const calculateInsights = require("./utils/insightCalculations");
const Notification = require("./models/Notification");
const ActivityLog = require("./models/ActivityLog");
const geoip = require("geoip-lite");

//========================= Set up multer for storing images =============================
// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp as filename
  },
});

const upload = multer({ storage: storage });

// POST route to handle the profile picture update
app.post(
  "/update-profile-picture",
  upload.single("profilePic"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { userId } = req.body; // The user ID from the client
    const profilePic = req.file.filename; // The new profile picture filename (stored by multer)

    // Validate the userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    try {
      // Convert userId to ObjectId after validation
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Find the user in the database
      const user = await User.findById(userObjectId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Delete the old profile picture if it exists
      if (
        user.profilePicture &&
        user.profilePicture !== "/images/default-profile.jpg"
      ) {
        const oldPicPath = path.join(__dirname, "public", user.profilePicture); // Path to old picture
        fs.unlink(oldPicPath, (err) => {
          if (err) {
            console.error("Error deleting old profile picture:", err);
          }
        });
      }

      // Update the user's profile picture URL in the database
      user.profilePicture = `/uploads/${profilePic}`; // Save new profile picture URL
      await user.save();

      // Return a success response with updated user data
      res.json({
        message: "Profile picture updated successfully",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePicture: user.profilePicture, // Updated profile picture URL
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating profile picture" });
    }
  }
);

//============================ Middleware =========================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key", // Make sure you set this in .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Use `true` in production with HTTPS
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
//========================================Registration Route ===============================
// Registration Route
app.post("/register", [
  check("email").isEmail().withMessage("Please enter a valid email."),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
  check("telephone")
    .matches(/^0[1-9]\d{7,8}$/)
    .withMessage("Please enter a valid Cambodian phone number."),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("register", { error: errors.array()[0].msg });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    confirm_password,
    nationalId,
    city,
    telephone,
    address,
    dob,
    accountType,
  } = req.body;

  // Validate password match
  if (password !== confirm_password) {
    return res.render("register", { error: "Passwords do not match" });
  }

  try {
    // Check for existing user by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "Email already exists" });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      nationalId,
      city,
      telephone,
      address,
      dob,
      accountType,
    });

    // Save user to the database
    await newUser.save();

    // Create a registration success notification
    const registrationNotification = new Notification({
      message: "Your account has been successfully registered!",
      user: newUser._id,
      type: "bank", // Notification type is bank-related
      priority: "high", // High priority for registration
    });

    await registrationNotification.save(); // Save the notification

    res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error);
    res.render("register", {
      error: "Registration failed. Please try again.",
    });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.render("login", { error: "Invalid email or password." });
  }

  // Check if the password matches
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render("login", { error: "Invalid email or password." });
  }

  // Issue JWT token and send it in a cookie (using JWT for authentication)
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Expiry time for the token
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }); // Use secure: true in production

  // Create a login success notification
  const loginNotification = new Notification({
    message: "You have successfully logged into your account.",
    user: user._id,
    type: "bank", // Bank-related notification
    priority: "medium", // Medium priority for login
  });

  await loginNotification.save(); // Save the notification

  // Redirect to the dashboard or home page after successful login
  res.redirect("/dashboard");
});


//============================= dashboard ==================================
app.get("/dashboard", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login"); // Ensure user is logged in

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    const user = await User.findById(decoded.id).lean(); // Fetch user data efficiently
    if (!user) {
      return res.clearCookie("token").redirect("/login"); // Redirect if user not found
    }

    // Ensure balances exist to prevent EJS errors
    user.checkingBalance = user.checkingBalance || 0;
    user.savingsBalance = user.savingsBalance || 0;
    user.fixedDepositBalance = user.fixedDepositBalance || 0;

    // Fetch activity logs for the user
    const activityLogs = await ActivityLog.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .lean();

    // Fetch user transactions (latest first)
    const transactions = await Transaction.find({ userId: user._id })
      .sort({ date: -1 })
      .lean();

    // Fetch insights safely
    let insights = {};
    try {
      insights = await calculateInsights(user._id, transactions) || {};
    } catch (err) {
      console.error("Error calculating insights:", err);
    }

    // Fetch notifications
    const notifications = await Notification.find({ user: user._id })
      .sort({ timestamp: -1 })
      .lean();

    // Fetch news notifications (if any)
    const newsNotifications = await Notification.find({ type: "news" })
      .sort({ timestamp: -1 })
      .lean();

    // Render dashboard with all required data
    res.render("dashboard", {
      user,
      activityLogs: activityLogs || [],
      transactions: transactions || [],
      insights,
      notifications: notifications || [],
      newsNotifications: newsNotifications || [],
      qrCodePath: `/qrcodes/qrcode-${user._id}.png`, // Path to user's QR code
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.clearCookie("token"); // Clear cookie if token is invalid
    res.redirect("/login"); // Redirect to login
  }
});



// Deposit Route
// Deposit Route
app.post("/deposit", async (req, res) => {
  const { amount, accountType } = req.body; // Extract accountType from the form
  const token = req.cookies.token;

  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Ensure amount is a number
    const depositAmount = parseFloat(amount);
    
    if (accountType === "USD") {
      // Update USD balance
      user.Dollar_balance += depositAmount;
    } else if (accountType === "KHR") {
      // Update KHR balance
      user.Khmer_balance += depositAmount;
    } else {
      return res.status(400).send("Invalid account type selected");
    }

    // Save the updated user data
    await user.save();

    // Generate unique transaction ID
    const transactionId = await generateTransactionId();

    // Create a new deposit transaction
    const newTransaction = new Transaction({
      userId: user._id,
      type: "deposit",
      amount: depositAmount,
      transactionId,
      status: "completed",
      description: `Deposit to ${accountType} account`,
    });

    // Save the transaction
    await newTransaction.save();

    res.redirect("/dashboard"); // Redirect to dashboard after success
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing deposit");
  }
});

// Withdraw Route
app.post("/withdraw", async (req, res) => {
  const { amount, accountType } = req.body; // Extract accountType from the form
  const token = req.cookies.token;

  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Ensure amount is a number
    const withdrawAmount = parseFloat(amount);
    
    if (accountType === "USD") {
      // Check if user has enough balance in USD
      if (user.Dollar_balance >= withdrawAmount) {
        // Subtract the withdraw amount from the Dollar_balance
        user.Dollar_balance -= withdrawAmount;
      } else {
        return res.send("Insufficient balance in USD account");
      }
    } else if (accountType === "KHR") {
      // Check if user has enough balance in KHR
      if (user.Khmer_balance >= withdrawAmount) {
        // Subtract the withdraw amount from the Khmer_balance
        user.Khmer_balance -= withdrawAmount;
      } else {
        return res.send("Insufficient balance in KHR account");
      }
    } else {
      return res.status(400).send("Invalid account type selected");
    }

    // Save the updated user data
    await user.save();

    // Generate unique transaction ID
    const transactionId = await generateTransactionId();

    // Create a new withdrawal transaction
    const newTransaction = new Transaction({
      userId: user._id,
      type: "withdraw",
      amount: withdrawAmount,
      transactionId,
      status: "completed",
      description: `Withdrawal from ${accountType} account`,
    });

    // Save the transaction
    await newTransaction.save();

    res.redirect("/dashboard"); // Redirect to dashboard after success
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing withdrawal");
  }
});

// Delete All Transactions
app.delete("/transactions/delete-all", async (req, res) => {
  try {
    await Transaction.deleteMany({}); // Delete all transactions
    res.status(200).send("All transactions deleted successfully");
  } catch (error) {
    console.error("Error deleting transactions:", error);
    res.status(500).send("Failed to delete transactions");
  }
});

// Get Insights for a User
app.get("/insights/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch transactions for the user
    const transactions = await Transaction.find({ userId });

    // Calculate insights
    const monthlySpending = calculateMonthlySpending(transactions);
    const savingsProgress = calculateSavingsProgress(transactions);
    const creditScore = calculateCreditScore(userId); // Placeholder function
    const netWorth = calculateNetWorth(userId); // Placeholder function
    const investmentGrowth = calculateInvestmentGrowth(userId); // Placeholder function
    const debtToIncomeRatio = calculateDebtToIncomeRatio(userId); // Placeholder function

    // Save or update insights
    const insights = await Insight.findOneAndUpdate(
      { userId },
      {
        monthlySpending,
        savingsProgress,
        creditScore,
        netWorth,
        investmentGrowth,
        debtToIncomeRatio,
        updatedAt: Date.now(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json(insights);
  } catch (error) {
    console.error("Error fetching insights:", error);
    res.status(500).send("Failed to fetch insights");
  }
});

// Fetch all notifications
app.get("/notifications/:userId", async (req, res) => {
  try {
    const userId = req.params.userId; // User ID from URL params

    // Fetch notifications for the user
    const notifications = await Notification.find({
      user: userId,
      type: "bank",
      status: "active",
    }).sort({ timestamp: -1 });

    // Fetch news notifications
    const newsNotifications = await Notification.find({
      user: userId,
      type: "news",
      status: "active",
    }).sort({ timestamp: -1 });

    res.render("notifications", { notifications, newsNotifications }); // Pass both notifications to the EJS view
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Logout Route
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// Views Routes
app.get("/", (req, res) => res.render("index"));
// Render Login page
app.get("/login", (req, res) => {
  res.render("login", { error: null }); // Ensure error is always defined
});

// Render Register page
app.get("/register", (req, res) => {
  res.render("register", { error: null }); // Ensure error is always defined
});

app.get("/forgot-password", (req, res) =>
  res.render("forgot-password", { errorMessage: null })
);

// Serve the FAQ page
app.get("/faq", (req, res) => {
  res.render("faq", { error: null }); // Ensure error is always defined
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
