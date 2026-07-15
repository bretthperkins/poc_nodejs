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
      permissions: getTokenPermissions(decoded?.payload),
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

    if (err.message.includes("jwt audience invalid")) {
      return {
        code: "TOKEN_AUDIENCE_INVALID",
        reason: "audience_mismatch",
        message: "Token audience does not match expected audience."
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

function getRecognizedAudiences() {
  const configured = [
    process.env.KEYCLOAK_AUDIENCE_CUSTOMER,
    process.env.KEYCLOAK_AUDIENCE_SELLER,
    ...(process.env.KEYCLOAK_RECOGNIZED_AUDIENCES || "").split(",")
  ];

  return [...new Set(configured.map((value) => value && value.trim()).filter(Boolean))];
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(" ")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getTokenPermissions(decoded) {
  const directPermissions = toArray(decoded?.permissions);
  const scopedPermissions = toArray(decoded?.scope);
  const scpPermissions = toArray(decoded?.scp);
  const realmRoles = toArray(decoded?.realm_access?.roles);
  const resourceRoles = Object.values(decoded?.resource_access || {}).flatMap((resource) =>
    toArray(resource?.roles)
  );

  return [...new Set([
    ...directPermissions,
    ...scopedPermissions,
    ...scpPermissions,
    ...realmRoles,
    ...resourceRoles
  ])];
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

  const recognizedAudiences = getRecognizedAudiences();

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
        const tokenAudiences = Array.isArray(tokenContext?.claims?.aud)
          ? tokenContext.claims.aud
          : tokenContext?.claims?.aud
            ? [tokenContext.claims.aud]
            : [];

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
            recognizedAudiences,
            clockToleranceSeconds: Number(process.env.JWT_CLOCK_TOLERANCE_SECONDS || 60),
            realm: process.env.KEYCLOAK_REALM,
            jwksUri: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/protocol/openid-connect/certs`
          },
          audienceDebug: {
            recognizedAudiences,
            tokenAudiences
          },
          token: tokenContext,
          issuerExpected: process.env.KEYCLOAK_AUTH_ISSUER_URL,
          authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
          realm: process.env.KEYCLOAK_REALM
        });

        const responseBody = {
          error: "Invalid token",
          code: failure.code,
          reason: failure.reason
        };

        if (exposeErrorDetails) {
          responseBody.message = failure.message;
          responseBody.recognizedAudiences = recognizedAudiences;
          responseBody.tokenAudiences = tokenAudiences;
        }

        return res.status(403).json(responseBody);
      }

      decoded.permissions = getTokenPermissions(decoded);
      req.user = decoded;
      next();
    }
  );
}

function requireAudience(expectedAudience) {
  return (req, res, next) => {
    if (!expectedAudience) {
      return next();
    }

    const tokenAudience = req.user?.aud;
    const audiences = Array.isArray(tokenAudience)
      ? tokenAudience
      : tokenAudience
        ? [tokenAudience]
        : [];

    if (!audiences.includes(expectedAudience)) {
      console.warn("Route audience check failed", {
        expectedAudience,
        tokenAudiences: audiences,
        method: req.method,
        path: req.originalUrl
      });

      return res.status(403).json({
        error: "Forbidden",
        code: "TOKEN_AUDIENCE_INVALID",
        reason: "audience_mismatch",
        expectedAudience,
        tokenAudiences: audiences
      });
    }

    return next();
  };
}

function requirePermission(expectedPermission) {
  return (req, res, next) => {
    if (!expectedPermission) {
      return next();
    }

    const tokenPermissions = req.user?.permissions || [];

    if (!tokenPermissions.includes(expectedPermission)) {
      console.warn("Route permission check failed", {
        expectedPermission,
        tokenPermissions,
        method: req.method,
        path: req.originalUrl
      });

      return res.status(403).json({
        error: "Forbidden",
        code: "TOKEN_PERMISSION_INVALID",
        reason: "permission_missing",
        expectedPermission,
        tokenPermissions
      });
    }

    return next();
  };
}

module.exports = { authenticateToken, requireAudience, requirePermission };
