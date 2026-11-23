import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authCookieName } from '../utils/auth.js';

export async function requireAuth(request, response, next) {
  const token = request.cookies[authCookieName];
  if (!token) {
    return response.status(401).json({ message: 'Please sign in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      return response.status(401).json({ message: 'Your session is invalid. Please sign in again.' });
    }

    const user = await User.findById(payload.sub).select('_id name email');
    if (!user) {
      return response.status(401).json({ message: 'Your account could not be found. Please sign in again.' });
    }

    request.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return response.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
    return next(error);
  }
}
