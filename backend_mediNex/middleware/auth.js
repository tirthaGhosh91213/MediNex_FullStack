import jwt from "jsonwebtoken";

/**
 * Auth Middleware
 * ──────────────
 * Three middleware functions for JWT-based role authorization:
 *
 * 1. verifyToken  — Validates the Bearer token, attaches decoded payload to req.user
 * 2. isAdmin      — Checks if the authenticated user has role === "admin"
 * 3. isBroker     — Checks if the authenticated user has role === "broker"
 *
 * Token payload structure (set during login):
 *   { id: <userId>, role: "admin" | "broker" | "patient" }
 */

// ── 1. Verify JWT Token ─────────────────────────────────────────
export const verifyToken = (req, res, next) => {
  try {
    // Expect header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request object for downstream use
    req.user = decoded; // { id, role, iat, exp }

    next();
  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// ── 2. Admin Role Check ─────────────────────────────────────────
export const isAdmin = (req, res, next) => {
  // verifyToken must run first to populate req.user
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// ── 3. Broker Role Check ────────────────────────────────────────
export const isBroker = (req, res, next) => {
  if (!req.user || req.user.role !== "broker") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Broker privileges required.",
    });
  }
  next();
};
