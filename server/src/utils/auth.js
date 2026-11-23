import jwt from 'jsonwebtoken';

export const authCookieName = 'expense_tracker_token';
export const authCookieMaxAge = 7 * 24 * 60 * 60 * 1000;

export function createAuthToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required. Add a long, random secret to server/.env.');
  return jwt.sign({ sub: userId.toString() }, secret, { expiresIn: '7d' });
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: authCookieMaxAge,
  };
}
