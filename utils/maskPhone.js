module.exports = (phone) => {
  return phone.slice(0, 3) + "xxx" + phone.slice(-4);
};
