const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/protocol/openid-connect/certs`
});

function toIsoTime(unixSeconds) {
  if (!Number.isFinite(unixSeconds)) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

function getTokenDebugContext(token) {
  if (!token) {
    return { tokenPresent: false };
  }

  const segments = token.split(".");
  const decoded = jwt.decode(token, { complete: true });

  return {
    tokenPresent: true,
    tokenShapeValid: segments.length === 3,
    tokenSegments: segments.length,
    header: {
      alg: decoded?.header?.alg,
      typ: decoded?.header?.typ,
      kid: decoded?.header?.kid
    },
    claims: {
      iss: decoded?.payload?.iss,
      aud: decoded?.payload?.aud,
      azp: decoded?.payload?.azp,
      client_id: decoded?.payload?.client_id,
      sub: decoded?.payload?.sub,
      iat: decoded?.payload?.iat,
      iatIso: toIsoTime(decoded?.payload?.iat),
      exp: decoded?.payload?.exp,
      expIso: toIsoTime(decoded?.payload?.exp)
    }
  };
}

function classifyJwtError(err) {
  if (!err) {
    return {
      code: "TOKEN_INVALID",
      reason: "invalid",
      message: "Token validation failed."
    };
  }

  if (err.name === "TokenExpiredError") {
    return {
      code: "TOKEN_EXPIRED",
      reason: "expired",
      message: "Token has expired. Request a new token."
    };
  }

  if (err.name === "NotBeforeError") {
    return {
      code: "TOKEN_NOT_ACTIVE",
      reason: "not_active",
      message: "Token is not active yet."
    };
  }

  if (err.name === "JsonWebTokenError") {
    if (err.message === "jwt malformed" || err.message === "jwt must be provided") {
      return {
        code: "TOKEN_MALFORMED",
        reason: "malformed",
        message: "Token format is invalid."
      };
    }

    if (err.message.includes("jwt issuer invalid")) {
      return {
        code: "TOKEN_ISSUER_INVALID",
        reason: "issuer_mismatch",
        message: "Token issuer does not match expected issuer."
      };
    }

    if (err.message.includes("invalid algorithm")) {
      return {
        code: "TOKEN_ALGORITHM_INVALID",
        reason: "algorithm_invalid",
        message: "Token signing algorithm is invalid."
      };
    }

    if (err.message.includes("invalid signature")) {
      return {
        code: "TOKEN_SIGNATURE_INVALID",
        reason: "signature_invalid",
        message: "Token signature could not be verified."
      };
    }
  }

  return {
    code: "TOKEN_INVALID",
    reason: "invalid",
    message: "Token validation failed."
  };
}

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
        const tokenContext = getTokenDebugContext(token);
        const failure = classifyJwtError(err);
        const exposeErrorDetails = process.env.JWT_EXPOSE_ERROR_DETAILS !== "false";

        console.error("JWT verification failed", {
          name: err.name,
          message: err.message,
          request: {
            method: req.method,
            path: req.originalUrl,
            ip: req.ip,
            userAgent: req.get("user-agent")
          },
          expected: {
            issuer: process.env.KEYCLOAK_AUTH_ISSUER_URL,
            algorithms: ["RS256"],
            clockToleranceSeconds: Number(process.env.JWT_CLOCK_TOLERANCE_SECONDS || 60),
            clientId: process.env.KEYCLOAK_CLIENT_ID,
            realm: process.env.KEYCLOAK_REALM,
            jwksUri: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/protocol/openid-connect/certs`
          },
          token: tokenContext,
          issuerExpected: process.env.KEYCLOAK_AUTH_ISSUER_URL,
          authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
          realm: process.env.KEYCLOAK_REALM,
          clientId: process.env.KEYCLOAK_CLIENT_ID
        });

        const responseBody = {
          error: "Invalid token",
          code: failure.code,
          reason: failure.reason
        };

        if (exposeErrorDetails) {
          responseBody.message = failure.message;
        }

        return res.status(403).json(responseBody);
      }

      req.user = decoded;
      next();
    }
  );
}

module.exports = { authenticateToken };
