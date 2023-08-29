const jwt = require('jsonwebtoken');
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 604800 });
};
module.exports = generateRefreshToken;
