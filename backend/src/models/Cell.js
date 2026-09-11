import mongoose from "mongoose";

const cellSchema = new mongoose.Schema(
  {
    row: {
      type: Number,
      required: true,
      min: 0,
    },
    column: {
      type: Number,
      required: true,
      min: 0,
    },
    owner: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

cellSchema.index({ row: 1, column: 1 }, { unique: true });
cellSchema.index({ owner: 1 });

export default mongoose.model("Cell", cellSchema);
