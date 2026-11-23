import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import User from '../models/User.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { authCookieMaxAge, authCookieName, authCookieOptions, createAuthToken } from '../utils/auth.js';

const router = Router();

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a little and try again.' },
});

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function validateCredentials(request, response, next) {
  const { email, password } = request.body ?? {};
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return response.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return response.status(400).json({ message: 'Password must be between 8 and 72 characters.' });
  }
  return next();
}

router.post('/register', authRateLimit, validateCredentials, async (request, response, next) => {
  const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
  if (name.length < 2 || name.length > 80) {
    return response.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
  }

  try {
    const email = request.body.email.trim().toLowerCase();
    const user = await User.create({ name, email, passwordHash: request.body.password });
    const token = createAuthToken(user.id);
    return response
      .cookie(authCookieName, token, { ...authCookieOptions(), maxAge: authCookieMaxAge })
      .status(201)
      .json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'An account with this email already exists.' });
    }
    return next(error);
  }
});

router.post('/login', authRateLimit, validateCredentials, async (request, response, next) => {
  try {
    const user = await User.findOne({ email: request.body.email.trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await user.comparePassword(request.body.password))) {
      return response.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const token = createAuthToken(user.id);
    return response
      .cookie(authCookieName, token, { ...authCookieOptions(), maxAge: authCookieMaxAge })
      .json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, (request, response) => {
  response.json({ user: publicUser(request.user) });
});

router.post('/logout', (_request, response) => {
  response.clearCookie(authCookieName, authCookieOptions()).json({ message: 'Signed out successfully.' });
});

export default router;
