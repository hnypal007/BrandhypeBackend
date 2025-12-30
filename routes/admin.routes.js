const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Case = require("../models/Case");
const CaseLog = require("../models/CaseLog");
const ExcelJS = require("exceljs");
const maskPhone = require("../utils/maskPhone");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { decrypt } = require("../utils/crypto");

/* ADMIN → ALL CASES (FULL DATA) */
router.get("/all-cases", auth, role("ADMIN"), async (req, res) => {
  try {
    const cases = await Case.find().select("+cardNumber");

    const data = cases.map(c => ({
      ...c._doc,
      cardNumber: c.cardNumber ? decrypt(c.cardNumber) : null
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* ADMIN → CASE LOGS */
router.get("/case-logs/:caseId", auth, role("ADMIN"), async (req, res) => {
  const logs = await CaseLog.find({ caseId: req.params.caseId });
  res.json(logs);
});

/* ONE TIME → CREATE ADMIN */
router.post("/create-admin", async (req, res) => {
  const { name, username, password } = req.body;

  const exist = await User.findOne({ username });
  if (exist) return res.status(400).json({ msg: "Admin exists" });

  const hashed = await bcrypt.hash(password, 10);

  await new User({
    name,
    username,
    password: hashed,
    role: "ADMIN"
  }).save();

  res.json({ msg: "Admin created" });
});

/* ADMIN → CREATE AGENT / TECH */
router.post("/create-user", auth, role("ADMIN"), async (req, res) => {
  const { name, username, password, role: userRole } = req.body;

  if (!["AGENT", "TECH"].includes(userRole))
    return res.status(400).json({ msg: "Invalid role" });

  const exist = await User.findOne({ username });
  if (exist) return res.status(400).json({ msg: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  await new User({
    name,
    username,
    password: hashed,
    role: userRole
  }).save();

  res.json({ msg: `${userRole} created` });
});


router.get(
  "/export-excel",
  auth,
  async (req, res) => {
    try {
      const userRole = req.user.role;
      const cases = await Case.find().select("+cardNumber");

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Cases");

      /* ================= ADMIN ================= */
      if (userRole === "ADMIN") {
        sheet.columns = [
          { header: "Agent Name", key: "agentName", width: 20 },
          { header: "Customer Name", key: "cxName", width: 20 },
          { header: "Phone", key: "phone", width: 15 },
          { header: "Email", key: "email", width: 25 },
          { header: "Address", key: "address", width: 25 },
          { header: "Amount", key: "amount", width: 10 },
          { header: "Services", key: "services", width: 15 },
          { header: "Issue", key: "issue", width: 30 },
          { header: "Device", key: "device", width: 15 },
          { header: "Model", key: "model", width: 15 },
          { header: "ISP", key: "isp", width: 15 },
          { header: "Payment Mode", key: "paymentMode", width: 15 },
          { header: "Card Number", key: "cardNumber", width: 20 },
          { header: "Agent Remark", key: "remark", width: 20 },
          { header: "Tech Remark", key: "techRemark", width: 20 },
          { header: "Issue Fixed", key: "issueFixed", width: 12 },
          { header: "Status", key: "status", width: 12 },
          { header: "Fix Date", key: "fixDate", width: 20 },
          { header: "Created At", key: "createdAt", width: 20 }
        ];

        cases.forEach(c => {
          sheet.addRow({
            ...c._doc,
            issueFixed: c.issueFixed ? "YES" : "NO",
            fixDate: c.fixDate ? c.fixDate.toLocaleString() : ""
          });
        });
      }

      /* ================= TECH ================= */
      if (userRole === "TECH") {
        sheet.columns = [
          { header: "Agent Name", key: "agentName", width: 20 },
          { header: "Customer Name", key: "cxName", width: 20 },
          { header: "Phone", key: "phone", width: 15 },
          { header: "Email", key: "email", width: 25 },
          { header: "Address", key: "address", width: 25 },
          { header: "Issue", key: "issue", width: 30 },
          { header: "Device", key: "device", width: 15 },
          { header: "Model", key: "model", width: 15 },
          { header: "ISP", key: "isp", width: 15 },
          { header: "Tech Remark", key: "techRemark", width: 20 },
          { header: "Issue Fixed", key: "issueFixed", width: 12 },
          { header: "Status", key: "status", width: 12 },
          { header: "Fix Date", key: "fixDate", width: 20 }
        ];

        cases.forEach(c => {
          sheet.addRow({
            agentName: c.agentName,
            cxName: c.cxName,
            phone:
              c.status === "RESOLVED"
                ? maskPhone(c.phone)
                : c.phone,
            email: c.email,
            address: c.address,
            issue: c.issue,
            device: c.device,
            model: c.model,
            isp: c.isp,
            techRemark: c.techRemark,
            issueFixed: c.issueFixed ? "YES" : "NO",
            status: c.status,
            fixDate: c.fixDate ? c.fixDate.toLocaleString() : ""
          });
        });
      }

      /* ================= AGENT ================= */
      if (userRole === "AGENT") {
        sheet.columns = [
          { header: "Agent Name", key: "agentName", width: 20 },
          { header: "Customer Name", key: "cxName", width: 20 },
          { header: "Phone", key: "phone", width: 15 },
          { header: "Email", key: "email", width: 25 },
          { header: "Address", key: "address", width: 25 },
          { header: "Amount", key: "amount", width: 10 },
          { header: "Services", key: "services", width: 15 },
          { header: "Issue", key: "issue", width: 30 },
          { header: "Payment Mode", key: "paymentMode", width: 15 },
          { header: "Remark", key: "remark", width: 20 },
          { header: "Status", key: "status", width: 12 },
          { header: "Created At", key: "createdAt", width: 20 }
        ];

        cases.forEach(c => {
          sheet.addRow({
            agentName: c.agentName,
            cxName: c.cxName,
            phone: c.phone,
            email: c.email,
            address: c.address,
            amount: c.amount,
            services: c.services,
            issue: c.issue,
            paymentMode: c.paymentMode,
            remark: c.remark,
            status: c.status,
            createdAt: c.createdAt.toLocaleString()
          });
        });
      }

      sheet.getRow(1).font = { bold: true };

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Cases.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Excel export failed" });
    }
  }
);

module.exports = router;
