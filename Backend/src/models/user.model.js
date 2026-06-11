const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const researchPreferencesSchema = require("./researchProfile.model");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name Is Required"],
      trim: true,
    },

    email: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      minlength: [6, "Password Must Be At Least 6 Characters Long"],
      select: false,
    },

    // OAuth Fields
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    providerId: { type: String, default: null },
    avatar: { type: String, default: "" },

    // ResearchMind Specific Roles
    role: {
      type: String,
      enum: ["ADMIN", "RESEARCHER", "USER"],
      default: "USER",
    },

    // Research-specific profile data
    researchProfile: {
      type: researchPreferencesSchema,
      default: () => ({}),
    },

    // Usage tracking for SaaS metrics
    apiUsageCount: { type: Number, default: 0 },
    isAccountActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Password hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Indexing for performance
userSchema.index({ role: 1 });
userSchema.index({ provider: 1, providerId: 1 });

module.exports = mongoose.model("User", userSchema);
