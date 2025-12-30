const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema({
  agentName: String,
  device: String,
  cxName: String,
  phone: String,
  email: String,
  address: String,
  amount: Number,
  services: String,
  issue: String,
  model: String,
  isp: String,
  paymentMode: String,
  caseId: String,
  remark: String,

  techRemark: String,
  issueFixed: Boolean,
  // ✅ FIX DATE / TIME
    fixDate: {
      type: Date,
      default: null
    },
  cardNumber: {
  type: String,
  select: false // 👈 default hide
},

  status: {
    type: String,
    enum: ["PENDING", "RESOLVED"],
    default: "PENDING"
  }
}, { timestamps: true });

module.exports = mongoose.model("Case", CaseSchema);
