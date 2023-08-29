const jwt = require('jsonwebtoken');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 604800 });
};
module.exports = generateToken;
