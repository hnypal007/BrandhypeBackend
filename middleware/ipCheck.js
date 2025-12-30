const allowedIPs = ["127.0.0.1", "::1"];

module.exports = (req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  if (!allowedIPs.includes(ip)) {
    return res.status(403).json({ msg: "IP not allowed" });
  }
  next();
};
