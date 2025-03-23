const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ["bank", "news", "payment", "alert"], // Notification types
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Link to the User model
    required: true,
  },
  link: {
    type: String,
    default: "",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["active", "archived"],
    default: "active",
  },
});

module.exports = mongoose.model("Notification", notificationSchema);