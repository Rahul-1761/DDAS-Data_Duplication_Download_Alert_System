const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  storedName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
  },
  size: {
    type: Number,
  },
  path: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    // ✅ This field was missing
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // or "Admin" depending on your schema
    required: true,
  },
});

module.exports = mongoose.model("File", fileSchema);
