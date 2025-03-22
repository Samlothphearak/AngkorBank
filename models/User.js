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
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return `AB${Math.floor(100000000 + Math.random() * 900000000)}`;
      },
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Ensure account number is unique
userSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Only generate a new account number on new users

  let isUnique = false;
  while (!isUnique) {
    this.accountNumber = `AB${Math.floor(100000000 + Math.random() * 900000000)}`;
    const existingUser = await mongoose.model("User").findOne({
      accountNumber: this.accountNumber,
    });
    if (!existingUser) isUnique = true;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
