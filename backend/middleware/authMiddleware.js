// ============================================================
// backend/middleware/authMiddleware.js  — JWT Verification
// ============================================================
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect — verifies Bearer JWT token from the Authorization header.
 * Attaches the full user document (minus password) to req.user.
 * 
 * Usage: router.get('/protected', protect, handler)
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Extract Bearer token from header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    // 2. Verify signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check user still exists in DB (handles deleted-account edge case)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    // 4. Attach user to request
    req.user = user;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(403).json({
      status: 'error',
      message: 'Invalid authentication token.',
    });
  }
};

/**
 * restrictTo — role-based access control middleware.
 * Usage: router.delete('/admin', protect, restrictTo('admin'), handler)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

/**
 * generateToken — signs a JWT for a given user ID.
 * Used in userController after login/register.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};
