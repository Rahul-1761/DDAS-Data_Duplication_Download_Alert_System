// models/Download.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const downloadSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
    downloadCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Ensure one user + file combo is unique (prevent duplicate entries)
downloadSchema.index({ userId: 1, fileId: 1 }, { unique: true });

module.exports = mongoose.model("Download", downloadSchema);
