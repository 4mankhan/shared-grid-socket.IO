import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [2, "Username must be at least 2 characters"],
      maxlength: [24, "Username must be at most 24 characters"],
      unique: true,
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code"],
    },
    lastClaimAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("User", userSchema);
