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
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header must be a Bearer token." });
  }

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token required for all requests." });
  }

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["RS256"],
      issuer: process.env.KEYCLOAK_AUTH_ISSUER_URL,
      // Tolerate minor clock skew between containers.
      clockTolerance: Number(process.env.JWT_CLOCK_TOLERANCE_SECONDS || 60)
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT verification failed", {
          name: err.name,
          message: err.message,
          issuerExpected: process.env.KEYCLOAK_AUTH_ISSUER_URL,
          authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
          realm: process.env.KEYCLOAK_REALM,
          clientId: process.env.KEYCLOAK_CLIENT_ID
        });
        return res.status(403).json({ error: "Invalid token" });
      }

      req.user = decoded;
      next();
    }
  );
}

module.exports = { authenticateToken };
