const mongoose = require("mongoose");

const CaseLogSchema = new mongoose.Schema({
  caseId: mongoose.Schema.Types.ObjectId,
  action: String,
  byRole: String,
  byUser: String,
  at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CaseLog", CaseLogSchema);
