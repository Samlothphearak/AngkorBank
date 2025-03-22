const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User schema
      required: true,
    },
    eventType: {
      type: String,
      enum: ["login", "logout", "password_change", "profile_update"], // Event types
      required: true,
    },
    location: {
      type: String, // Can store the city or location information (based on geolocation)
    },
    ipAddress: {
      type: String,
      required: true,
    },
    browserInfo: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now, // Automatically set timestamp
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
