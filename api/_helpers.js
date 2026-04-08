const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET    || 'salon_secret_2025';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '1234';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(req) {
  try {
    const auth  = req.headers['authorization'] || '';
    const token = auth.replace('Bearer ', '').trim();
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (e) { return null; }
}

function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ ok: false, message: 'Unauthorized' });
    return false;
  }
  return true;
}

async function getRedis() {
  const { Redis } = require('@upstash/redis');
  return new Redis({
    url:   process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

async function getBookings() {
  try {
    const redis = await getRedis();
    const data  = await redis.get('bookings');
    return data || [];
  } catch (e) { return []; }
}

async function saveBookings(bookings) {
  const redis = await getRedis();
  await redis.set('bookings', bookings);
}

module.exports = {
  setCors, signToken, verifyToken, requireAuth,
  getBookings, saveBookings,
  ADMIN_USER, ADMIN_PASS
};