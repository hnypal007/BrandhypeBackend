const crypto = require("crypto");

const algorithm = "aes-256-cbc";

function getKey() {
  const secret = process.env.CARD_SECRET || 'default-secret-key-change-this';
  return crypto
    .createHash("sha256")
    .update(secret)
    .digest("base64")
    .substr(0, 32);
}

const iv = Buffer.alloc(16, 0);

exports.encrypt = (text) => {
  if (!text) return null;
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

exports.decrypt = (encrypted) => {
  if (!encrypted) return null;
  const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
