import jwt from 'jsonwebtoken';
import { env } from './env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

