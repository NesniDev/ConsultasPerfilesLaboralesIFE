import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

function base64Encode(str) {
  return Buffer.from(str).toString('base64');
}

function base64Decode(str) {
  return Buffer.from(str, 'base64').toString('utf-8');
}

export function generateJWT(payload) {
  const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Encode(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64');
  return `${header}.${body}.${signature}`;
}

export function verifyJWT(token) {
  try {
    if (!token) return null;
    const [header, body, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64');
    if (signature !== expectedSignature) return null;
    const decoded = JSON.parse(base64Decode(body));
    return decoded;
  } catch (e) {
    return null;
  }
}

export async function hashPassword(password) {
  // Simple hash using SHA-256 (for production, use bcrypt)
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function comparePassword(password, hash) {
  const computed = crypto.createHash('sha256').update(password).digest('hex');
  return computed === hash;
}
