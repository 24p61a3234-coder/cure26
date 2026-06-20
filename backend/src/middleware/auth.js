import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isMemoryMode } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET is required in production' });
    }
    const secret = process.env.JWT_SECRET || 'queue-cure-26-development-secret';
    const decoded = jwt.verify(token, secret);
    if (isMemoryMode()) {
      req.user = memoryStore.currentUser();
      req.clinicId = memoryStore.clinic._id;
      return next();
    }

    const user = await User.findById(decoded.id).populate('clinic');
    if (!user) return res.status(401).json({ message: 'User no longer exists' });

    req.user = user;
    req.clinicId = user.clinic._id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission for this action' });
    }
    next();
  };
}
