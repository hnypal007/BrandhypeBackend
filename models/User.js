const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["ADMIN", "AGENT", "TECH"],
    required: true
  },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model("User", UserSchema);
