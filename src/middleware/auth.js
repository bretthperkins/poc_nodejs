const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/protocol/openid-connect/certs`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token required for all requests." });
  }

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["RS256"],
      issuer: process.env.KEYCLOAK_AUTH_SERVER_URL
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(403).json({ error: "Invalid token" });
      }

      req.user = decoded;
      next();
    }
  );
}

module.exports = { authenticateToken };
