const express = require("express");
const router = express.Router();

const Case = require("../models/Case");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const ipCheck = require("../middleware/ipCheck");

const { encrypt } = require("../utils/crypto");
const maskPhone = require("../utils/maskPhone");

/* AGENT → CREATE CASE */
router.post("/create", auth, role("AGENT"), ipCheck, async (req, res) => {
  try {
    const { phone, cxName, cardNumber } = req.body;

    if (!cxName || !phone)
      return res.status(400).json({ msg: "Required fields missing" });

    if (phone.length !== 10)
      return res.status(400).json({ msg: "Invalid phone" });

    if (cardNumber) {
      req.body.cardNumber = encrypt(cardNumber);
    }

    await new Case(req.body).save();
    res.json({ msg: "Case created" });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* TECH → VIEW CASES (MASKED PHONE) */
/* TECH → VIEW CASES (CONDITIONAL PHONE VISIBILITY) */
router.get("/tech", auth, role("TECH"), ipCheck, async (req, res) => {
  try {
    const cases = await Case.find();

    const data = cases.map(c => {
      let phoneToShow = c.phone;

      // ✅ IF issue FIXED → MASK NUMBER
      if (c.status === "RESOLVED" || c.issueFixed === true) {
        phoneToShow = maskPhone(c.phone);
      }

      // ❌ IF NOT FIXED → FULL NUMBER VISIBLE
      return {
        ...c._doc,
        phone: phoneToShow
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


/* =========================
   TECH → FIX / NOT FIX ISSUE
========================= */
/* =========================
   TECH → FIX / NOT FIX ISSUE
========================= */
router.put(
  "/tech/fix/:id",
  auth,
  role("TECH"),
  ipCheck,
  async (req, res) => {
    try {
      const { issueFixed, techRemark } = req.body;

      // Validation
      if (typeof issueFixed !== "boolean") {
        return res
          .status(400)
          .json({ msg: "issueFixed must be true or false" });
      }

      const caseData = await Case.findById(req.params.id);
      if (!caseData) {
        return res.status(404).json({ msg: "Case not found" });
      }

      // Update fields
      caseData.issueFixed = issueFixed;
      caseData.techRemark = techRemark || "";

    if (issueFixed === true) {
        caseData.status = "RESOLVED";
        caseData.fixDate = new Date(); // ✅ AUTO FIX DATE
      } else {
        caseData.status = "PENDING";
        caseData.fixDate = null; // ❌ reset
      }


      await caseData.save();

      res.json({
        msg: issueFixed
          ? "Issue successfully FIXED"
          : "Issue NOT FIXED, marked pending",
        data: {
          id: caseData._id,
          status: caseData.status,
          issueFixed: caseData.issueFixed
        }
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);



module.exports = router;
