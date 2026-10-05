const jwt = require("jsonwebtoken");

// Payload intentionally only carries userId + role: enough for the `protect`
// and `isAdmin` middleware to do their job without a DB lookup on every
// request being strictly required (we still re-fetch the user in `protect`
// so we always see up-to-date role/existence, but the token itself is self-contained).
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = generateToken;
