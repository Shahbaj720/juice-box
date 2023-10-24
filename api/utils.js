const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");

async function requireUser(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    if (id) {
      req.user = await getUserById(id); // Attach user object to the request
      next();
    } else {
      next({
        name: "AuthorizationHeaderError",
        message: "Authorization token malformed",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
}

module.exports = requireUser;
