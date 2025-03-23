const mongoose = require("mongoose");

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
    // Separate balances for each account type
    Dollar_balance: {
      type: Number,
      default: 0.00,
    },
    Khmer_balance: {
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
      unique: true,
    },
    Khmer_accountNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Ensure unique account numbers
userSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  let isUnique = false;
  while (!isUnique) {
    this.Dollar_accountNumber = `USD${Math.floor(100000000 + Math.random() * 900000000)}`;
    this.Khmer_accountNumber = `KHR${Math.floor(100000000 + Math.random() * 900000000)}`;

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
