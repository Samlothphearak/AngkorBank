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
      enum: ["login", "logout", "password_change", "profile_update", "failed_login"], // Add more event types as needed
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
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
