const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");
const Case = require("./models/Case");
const { encrypt } = require("./utils/crypto");

dotenv.config();

const users = [
  {
    name: "Admin User",
    username: "admin",
    password: "admin123",
    role: "ADMIN"
  },
  {
    name: "John Agent",
    username: "agent1",
    password: "agent123",
    role: "AGENT"
  },
  {
    name: "Sarah Agent",
    username: "agent2",
    password: "agent123",
    role: "AGENT"
  },
  {
    name: "Mike Tech",
    username: "tech1",
    password: "tech123",
    role: "TECH"
  },
  {
    name: "Lisa Tech",
    username: "tech2",
    password: "tech123",
    role: "TECH"
  }
];

const cases = [
  {
    cxName: "Rajesh Kumar",
    phone: "9876543210",
    cardNumber: "4532123456789012",
    issue: "Card declined at POS terminal",
    status: "PENDING",
    issueFixed: false
  },
  {
    cxName: "Priya Sharma",
    phone: "9988776655",
    cardNumber: "5412345678901234",
    issue: "Unable to activate card online",
    status: "PENDING",
    issueFixed: false
  },
  {
    cxName: "Amit Patel",
    phone: "8899776655",
    cardNumber: "6011123456789012",
    issue: "ATM withdrawal failed",
    status: "RESOLVED",
    issueFixed: true
  },
  {
    cxName: "Sneha Reddy",
    phone: "7766554433",
    issue: "Card not received after 10 days",
    status: "PENDING",
    issueFixed: false
  },
  {
    cxName: "Rahul Verma",
    phone: "9876512345",
    cardNumber: "4916123456789012",
    issue: "Unauthorized transaction detected",
    status: "RESOLVED",
    issueFixed: true
  },
  {
    cxName: "Anita Singh",
    phone: "8765432109",
    issue: "Lost card - need replacement",
    status: "PENDING",
    issueFixed: false
  },
  {
    cxName: "Vikram Mehta",
    phone: "9123456789",
    cardNumber: "5512345678901234",
    issue: "PIN reset request",
    status: "RESOLVED",
    issueFixed: true
  },
  {
    cxName: "Kavita Joshi",
    phone: "8234567890",
    cardNumber: "4024007156789012",
    issue: "Card blocked after wrong PIN attempts",
    status: "PENDING",
    issueFixed: false
  },
  {
    cxName: "Suresh Nair",
    phone: "9345678901",
    issue: "International transaction not working",
    status: "PENDING",
    issueFixed: false
  },
  {
    cxName: "Deepa Iyer",
    phone: "8456789012",
    cardNumber: "6011987654321098",
    issue: "Reward points not credited",
    status: "RESOLVED",
    issueFixed: true
  },
  {
    cxName: "Arjun Kapoor",
    phone: "9567890123",
    issue: "Unable to set up autopay",
    status: "PENDING",
    issueFixed: false
  },
  {
    cxName: "Neha Gupta",
    phone: "8678901234",
    cardNumber: "4532876543210987",
    issue: "Statement not received",
    status: "RESOLVED",
    issueFixed: true
  },
  {
    cxName: "Karan Malhotra",
    phone: "9789012345",
    issue: "Credit limit increase request",
    status: "PENDING",
    issueFixed: false
  },
  {
    cxName: "Pooja Desai",
    phone: "8890123456",
    cardNumber: "5412987654321098",
    issue: "Duplicate charge on statement",
    status: "PENDING",
    issueFixed: false
  },
  {
    cxName: "Sanjay Rao",
    phone: "9901234567",
    issue: "Annual fee waiver request",
    status: "RESOLVED",
    issueFixed: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Clear existing data
    await User.deleteMany({});
    await Case.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create users
    console.log("\n👥 Creating users...");
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        name: user.name,
        username: user.username,
        password: hashedPassword,
        role: user.role
      });
      console.log(`   ✓ Created ${user.role}: ${user.username} (password: ${user.password})`);
    }

    // Create cases with encrypted card numbers
    console.log("\n📋 Creating cases...");
    for (const caseData of cases) {
      const caseObj = { ...caseData };
      if (caseObj.cardNumber) {
        caseObj.cardNumber = encrypt(caseObj.cardNumber);
      }
      await Case.create(caseObj);
      console.log(`   ✓ Created case for ${caseData.cxName} - ${caseData.status}`);
    }

    console.log("\n✨ Demo data seeding completed successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:  username: admin   password: admin123");
    console.log("Agent:  username: agent1  password: agent123");
    console.log("Agent:  username: agent2  password: agent123");
    console.log("Tech:   username: tech1   password: tech123");
    console.log("Tech:   username: tech2   password: tech123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🌐 Open http://localhost:5000 to test the application");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
