const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    telephone: {
      type: String,
      required: true,
      match: [
        /^(0[1-9])\d{7,8}$/,
        "Please enter a valid Cambodian phone number",
      ],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0.00,
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "KHR"],
      default: "USD",
    },
    city: {
      type: String,
      required: true,
      enum: [
        "Phnom Penh",
        "Siem Reap",
        "Battambang",
        "Sihanoukville",
        "Kampong Cham",
        "Kampong Thom",
        "Kratie",
        "Preah Sihanouk",
        "Pursat",
        "Takeo",
        "Kandal",
        "Kampong Speu",
        "Prey Veng",
        "Svay Rieng",
        "Koh Kong",
        "Mondulkiri",
        "Rattanakiri",
        "Stung Treng",
        "Oddar Meanchey",
        "Pailin",
        "Tboung Khmum",
      ],
    },
    nationalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    accountType: {
      type: String,
      required: true,
      enum: ["savings", "current", "fixed"],
    },
    profilePicture: {
      type: String,
      default: "/images/default-profile.jpg",
    },
    Dollar_accountNumber: {
      type: String,
      unique: true, // Make sure the number is unique
    },
    Khmer_accountNumber: {
      type: String,
      unique: true, // Make sure the number is unique
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Ensure unique account numbers
userSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Only generate new account numbers for new users

  let isUnique = false;
  while (!isUnique) {
    // Generate a unique USD account number with format "USD" + 9-digit random number
    this.Dollar_accountNumber = `USD${Math.floor(100000000 + Math.random() * 900000000)}`;
    // Generate a unique KHR account number with format "KHR" + 9-digit random number
    this.Khmer_accountNumber = `KHR${Math.floor(100000000 + Math.random() * 900000000)}`;

    // Check if either account number already exists
    const existingUser = await mongoose.model("User").findOne({
      $or: [
        { Dollar_accountNumber: this.Dollar_accountNumber },
        { Khmer_accountNumber: this.Khmer_accountNumber },
      ],
    });

    if (!existingUser) isUnique = true;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);