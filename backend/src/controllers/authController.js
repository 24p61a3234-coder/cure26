import jwt from 'jsonwebtoken';
import validator from 'validator';
import { isMemoryMode } from '../config/db.js';
import User from '../models/User.js';
import { memoryStore } from '../utils/memoryStore.js';

function signToken(user) {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }
  const secret = process.env.JWT_SECRET || 'queue-cure-26-development-secret';
  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    clinic: user.clinic
  };
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Valid email and password are required' });
    }

    if (isMemoryMode()) {
      const session = memoryStore.login({ email, password });
      if (!session) return res.status(401).json({ message: 'Invalid credentials' });
      return res.json(session);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('clinic');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
